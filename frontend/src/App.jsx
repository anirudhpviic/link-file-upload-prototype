import React, { useState } from "react";
import axios from "axios";
import pLimit from "p-limit";

const CHUNK_SIZE = 10 * 1024 * 1024;

// TODO: progress bar after reaching limit new api not showing
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

  const getDynamicChunks = (
    fileSize,
    chunkSize,
    minChunkSize = 5 * 1024 * 1024
  ) => {
    let totalChunks = Math.ceil(fileSize / chunkSize);
    let chunks = [];

    for (let i = 0; i < totalChunks; i++) {
      let start = i * chunkSize;
      let end = Math.min(start + chunkSize, fileSize);

      // Adjust if the last chunk is smaller than the minimum allowed size
      if (i === totalChunks - 1 && end - start < minChunkSize) {
        let previousChunk = chunks.pop(); // Remove the last chunk
        start = previousChunk.start; // Adjust start position
        end = fileSize; // Extend last chunk to include the remaining data
        totalChunks--;
      }

      chunks.push({ start, end });
    }

    return { chunks, totalChunks };
  };

  const uploadFile = async (file) => {
    const limit = pLimit(6); // 6 concurrent uploads

    const { chunks, totalChunks } = getDynamicChunks(file.size, CHUNK_SIZE);

    const { uploadId, preSignedUrls } = await getPreSignedUrls(
      file.name,
      totalChunks
    );

    let uploadedParts = [];

    await Promise.all(
      preSignedUrls.map(({ partNumber, url }, index) =>
        limit(async () => {
          const { start, end } = chunks[index];
          const chunk = file.slice(start, end);

          const res = await axios.put(url, chunk, {
            onUploadProgress: (progressEvent) => {
              const chunkProgress =
                (progressEvent.loaded / progressEvent.total) * 100;
              console.log(chunkProgress);
              setUploadProgress((prevProgress) =>
                chunkProgress > prevProgress ? chunkProgress : prevProgress
              );
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
        <img src={uploadedFileUrl} alt="Uploaded" style={{ width: "400px" }} />
      );
    } else if (fileType.includes("video")) {
      return (
        <video src={uploadedFileUrl} controls style={{ width: "400px" }} />
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
            width: "200px",
            background: "#ddd",
            marginTop: "10px",
            borderRadius: "5px",
            overflow: "hidden",
            position: "relative",
            marginBottom: "10px",
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
