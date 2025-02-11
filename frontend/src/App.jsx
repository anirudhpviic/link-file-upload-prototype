import React, { useState } from "react";
import axios from "axios";
import pLimit from "p-limit";

const CHUNK_SIZE = 100 * 1024 * 1024; // 12MB per chunk

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

  // less than 5mb problem
  // upload time problem
  // const uploadFile = async (file) => {
  //   try {
  //     setUploadProgress(0);
  //     const fileSize = file.size;
  //     let uploadedBytes = 0;

  //     const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  //     // Get pre-signed URLs
  //     const { uploadId, preSignedUrls } = await getPreSignedUrls(
  //       file.name,
  //       totalChunks
  //     );

  //     let uploadedParts = [];

  //     await Promise.all(
  //       preSignedUrls.map(async ({ partNumber, url }) => {
  //         const start = (partNumber - 1) * CHUNK_SIZE;
  //         const end = Math.min(start + CHUNK_SIZE, file.size);
  //         const chunk = file.slice(start, end);

  //         // correct upload progress
  //         const res = await axios.put(url, chunk, {
  //           onUploadProgress: (progressEvent) => {
  //             if (progressEvent.progress) {
  //               uploadedBytes += progressEvent.progress;
  //               const progress = (uploadedBytes / fileSize) * 100;
  //               console.log("uploadedBytes:", uploadedBytes);
  //               console.log("file size:", fileSize);
  //               console.log("Upload progress:", progress);

  //               setUploadProgress(progress);
  //             }
  //           },
  //         });

  //         const eTag = res.headers["etag"]?.replace(/^"(.*)"$/, "$1");
  //         uploadedParts.push({ PartNumber: partNumber, ETag: eTag });
  //       })
  //     );

  //     // 3️⃣ Complete multipart upload
  //     const publicUrl = await completeUpload(
  //       file.name,
  //       uploadId,
  //       uploadedParts
  //     );

  //     setUploadedFileUrl(publicUrl);
  //     setFileType(file.type);
  //     setUploadProgress(100);
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //   }
  // };

  const uploadFile = async (file) => {
    // const limit = pLimit(3); // Adjust this number to control parallel uploads
    const limit = pLimit(6); // Try 6 or 8 instead of 3

    const fileSize = file.size;
    let uploadedBytes = 0;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const { uploadId, preSignedUrls } = await getPreSignedUrls(
      file.name,
      totalChunks
    );

    let uploadedParts = [];

    await Promise.all(
      preSignedUrls.map(({ partNumber, url }) =>
        limit(async () => {
          const start = (partNumber - 1) * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const res = await axios.put(url, chunk, {
            onUploadProgress: (progressEvent) => {
              const chunkProgress =
                (progressEvent.loaded / progressEvent.total) * 100;
              console.log(`Chunk ${partNumber} progress:`, chunkProgress);
              setUploadProgress(chunkProgress);
            },
          });

          const eTag = res.headers["etag"]?.replace(/^"(.*)"$/, "$1");
          uploadedParts.push({ PartNumber: partNumber, ETag: eTag });
        })
      )
    );

    const publicUrl = await completeUpload(file.name, uploadId, uploadedParts);
    setUploadedFileUrl(publicUrl);
    setFileType(file.type);
    setUploadProgress(100);
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
    <div style={{ width: "70%", height: "50vh", border: "1px solid yellow" }}>
      <h2>Chunked File Upload</h2>
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div
          style={{
            width: "100%",
            background: "#ddd",
            marginTop: "10px",
            borderRadius: "5px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${uploadProgress}%`,
              maxWidth: "100%",
              background: "green",
              height: "10px",
              borderRadius: "5px",
              transition: "width 0.3s ease-in-out",
            }}
          />
        </div>
      )}

      {uploadedFileUrl && filePreview(fileType, uploadedFileUrl)}
    </div>
  );
};

export default App;
