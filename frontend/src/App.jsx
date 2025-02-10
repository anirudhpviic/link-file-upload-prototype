// import React, { useState } from "react";
// import axios from "axios";

// const App = () => {
//   const [uploadedFileUrl, setUploadedFileUrl] = useState("");
//   const [fileType, setFileType] = useState("");
//   const [uploadProgress, setUploadProgress] = useState(0); // State for progress

//   const getPreSignedUrl = async (fileName, fileType) => {
//     return await axios.post("http://localhost:3000/archive/presigned-url", {
//       fileName,
//       fileType,
//     });
//   };

//   const makeFilePublic = async (fileName) => {
//     return await axios.post("http://localhost:3000/archive/make-file-public", {
//       fileName,
//     });
//   };

//   const splitFileIntoTwoChunks = (file) => {
//     const fileSize = file.size;
//     const middle = Math.ceil(fileSize / 2); // Find halfway point

//     const chunk1 = file.slice(0, middle); // First half
//     const chunk2 = file.slice(middle, fileSize); // Second half

//     return [chunk1, chunk2];
//   };

//   const uploadFile = async (file) => {
//     try {
//       let elapsedTime = 0;
//       const interval = setInterval(() => {
//         elapsedTime++;
//         console.log(`Elapsed Time: ${elapsedTime} seconds`);
//       }, 1000); // Update every second

//       const res = await getPreSignedUrl(file.name, file.type);
//       // await axios.put(res.data.data, file);

//       const chunks = splitFileIntoTwoChunks(file);
//       console.log("chunks", chunks);

//       // Step 2: Upload File using Axios with progress tracking
//       const result = await axios.put(res.data.data, file, {
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadProgress(percentCompleted);
//         },
//       });

//       console.log("uploaded reslt", result);
//       const uploadedFile = await makeFilePublic(file.name);
//       clearInterval(interval);
//       console.log(`Total Upload Time: ${elapsedTime} seconds`);
//       // Reset progress after upload completes
//       setUploadProgress(100);
//       setFileType(file.type);
//       setUploadedFileUrl(uploadedFile.data.data);
//     } catch (error) {
//       console.log("Error:", error);
//     }
//   };

//   const filePreview = (fileType, uploadedFileUrl) => {
//     if (fileType.includes("image")) {
//       return (
//         <img src={uploadedFileUrl} alt="Uploaded" style={{ width: "200px" }} />
//       );
//     } else if (fileType.includes("video")) {
//       return (
//         <video src={uploadedFileUrl} controls style={{ width: "200px" }} />
//       );
//     }
//   };

//   return (
//     <div>
//       App
//       <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
//       {/* Progress Bar */}
//       {uploadProgress > 0 && (
//         <div style={{ width: "100%", background: "#ccc", marginTop: "10px" }}>
//           <div
//             style={{
//               width: `${uploadProgress}%`,
//               background: "green",
//               height: "10px",
//             }}
//           />
//         </div>
//       )}
//       {uploadedFileUrl && filePreview(fileType, uploadedFileUrl)}
//     </div>
//   );
// };

// export default App;

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
    return res.data; // { fileUrl }
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

      // // Upload each chunk
      const uploadPromises = preSignedUrls.map(async ({ partNumber, url }) => {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const res = await fetch(url, {
          method: "PUT",
          body: chunk,
        });

        const eTag = res.headers.get("ETag");
        const formattedETag = eTag.replace(/^"(.*)"$/, "$1");
        uploadedParts.push({ PartNumber: partNumber, ETag: formattedETag });
      });

      await Promise.all(uploadPromises);

      console.log("uploadedParts", uploadedParts);
      // 3️⃣ Complete multipart upload
      const lastRes = await completeUpload(file.name, uploadId, uploadedParts);
      console.log("lastRes", lastRes);
      // setUploadedFileUrl(fileUrl);
      setFileType(file.type);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  /**
   * Displays file preview
   */
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
