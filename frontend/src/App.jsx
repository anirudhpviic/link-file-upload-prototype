import React, { useState } from "react";
import axios from "axios";
import pLimit from "p-limit";

const CHUNK_SIZE = 500 * 1024 * 1024;
const MIN_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzk4YmQwNWRjMzVhYjZlOGI2ODg5NTAiLCJkZXBhcnRtZW50IjoiREVWRUxPUEVSIiwidXNlck5hbWUiOiJhbmlydWRoIiwicHJvZmlsZUltZyI6Imh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvbGluay04MWE5MC5hcHBzcG90LmNvbS9vL0lNR18yMDIzMTAyN18xMDQ4MjIuanBnP2FsdD1tZWRpYSZ0b2tlbj1lMTBmNmU4NS0yMjZkLTQ0Y2UtOTNlMi00ODBhNjdkNTRmZWYiLCJ1c2VyRW1haWwiOiJhbmlydWRoMTIzQGdtYWlsLmNvbSIsImlhdCI6MTc0MjI4MTEwOSwiZXhwIjoxNzQ0ODczMTA5fQ.zv72nzMMxUHYBSeLzCdFn3zZeNVXO2MhK7_W2tOvZEA";

const App = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const getPreSignedUrls = async (fileName, totalChunks) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/chats/presigned-url",
        {
          fileName,
          totalChunks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.data;
    } catch (error) {
      console.error(error);
    }
  };

  const completeUpload = async ({
    uniqueFileName,
    uploadId,
    uploadedParts,
    fileSize,
    channelId,
    message,
  }) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/chats/complete-upload",
        {
          fileName: uniqueFileName,
          uploadId,
          parts: uploadedParts,
          fileSize,
          channelId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", res);
      return res.data.data; // public url
    } catch (error) {
      console.error(error);
    }
  };

  const getDynamicChunks = (fileSize, chunkSize, minChunkSize) => {
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
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = fileBuffer.byteLength;

    let chunkProgress = {}; // Store progress for each chunk

    let chunks;
    let totalChunks;

    console.log("fileSizeInMB", file.size);
    console.log("Min chunk size", MIN_CHUNK_SIZE);

    if (file.size > MIN_CHUNK_SIZE) {
      console.log("seprate");
      const result = getDynamicChunks(file.size, CHUNK_SIZE, MIN_CHUNK_SIZE);

      chunks = result.chunks;
      totalChunks = result.totalChunks;
    } else {
      chunks = [{ start: 0, end: CHUNK_SIZE }];
      totalChunks = 1;
    }

    // need to use return fileName this is unique created from backend
    const { uploadId, preSignedUrls, fileName, fileUrl } =
      await getPreSignedUrls(file.name, totalChunks);

    console.log("uniqurFileName:", fileName);
    console.log("chunks", chunks);
    console.log("totalChunks", totalChunks);

    let uploadedParts = [];

    // parallel upload - max 6
    await Promise.all(
      preSignedUrls.map(({ partNumber, url }, index) =>
        limit(async () => {
          const { start, end } = chunks[index];
          const chunk = file.slice(start, end);

          const res = await axios.put(url, chunk, {
            onUploadProgress: (progressEvent) => {
              // save progress of each chunk upload
              chunkProgress[partNumber] = {
                progress: progressEvent.loaded,
              };

              const totalProgress = Object.values(chunkProgress).reduce(
                (total, chunk) => total + (chunk.progress || 0),
                0
              );

              const totalUploadProgress = (totalProgress / fileBytes) * 100;
              setUploadProgress(totalUploadProgress);
            },
          });

          const eTag = res.headers["etag"]?.replace(/^"(.*)"$/, "$1");
          uploadedParts.push({ PartNumber: partNumber, ETag: eTag });
        })
      )
    );

    // uniqueFileName is important it used to stop overriding existing files
    await completeUpload({
      uniqueFileName: fileName,
      uploadId,
      uploadedParts,
      fileSize: file.size,
      channelId: "67d27ba96cf1aa7c944d4bdd",
      message: {
        file: fileUrl,
        message: "hi file",
        meta: {
          message: "hi file",
          data: "meta checking",
        },
      },
    });

    // console.log("public url: ", publicUrl);
    // setUploadedFileUrl(publicUrl);
    // setFileType(file.type);
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
