import React, { useState } from "react";
import axios from "axios";

const CHUNK_SIZE = 12 * 1024 * 1024; // 5MB per chunk

const App = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const getPreSignedUrls = async (fileName, totalChunks) => {
    const res = await axios.post(
      "http://localhost:3000/archive/presigned-url",
      {
        fileName,
        totalChunks,
      }
    );
    return res.data.data;
  };

  const completeUpload = async (fileName, uploadId, uploadedParts) => {
    const res = await axios.post(
      "http://localhost:3000/archive/complete-upload",
      {
        fileName,
        uploadId,
        parts: uploadedParts,
      }
    );
    return res.data.data; // public url
  };

  const uploadFile = async (file) => {
    try {
      setUploadProgress(0);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // Get pre-signed URLs
      const { uploadId, preSignedUrls } = await getPreSignedUrls(
        file.name,
        totalChunks
      );

      let uploadedParts = [];
      // Upload each chunk
      const uploadPromises = preSignedUrls.map(async ({ partNumber, url }) => {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const res = await fetch(url, {
          method: "PUT",
          body: chunk,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        const eTag = res.headers.get("ETag");
        const formattedETag = eTag.replace(/^"(.*)"$/, "$1");
        uploadedParts.push({ PartNumber: partNumber, ETag: formattedETag });
      });

      await Promise.all(uploadPromises);

      // 3️⃣ Complete multipart upload
      const publicUrl = await completeUpload(
        file.name,
        uploadId,
        uploadedParts
      );

      setUploadedFileUrl(publicUrl);
      setFileType(file.type);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Displays file preview
  const filePreview = (fileType, uploadedFileUrl) => {
    if (fileType.includes("image")) {
      return (
        <img src={uploadedFileUrl} alt="Uploaded" style={{ width: "200px" }} />
      );
    } else if (fileType.includes("video")) {
      return (
        <video src={uploadedFileUrl} controls style={{ width: "200px" }} />
      );
    }
  };

  return (
    <div>
      <h2>Chunked File Upload</h2>
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div style={{ width: "100%", background: "#ccc", marginTop: "10px" }}>
          <div
            style={{
              width: `${uploadProgress}%`,
              background: "green",
              height: "10px",
            }}
          />
        </div>
      )}

      {uploadedFileUrl && filePreview(fileType, uploadedFileUrl)}
    </div>
  );
};

export default App;
