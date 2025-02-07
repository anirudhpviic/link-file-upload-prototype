import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const getPreSignedUrl = async (fileName, fileType) => {
    return await axios.post("http://localhost:3000/archive/presigned-url", {
      fileName,
      fileType,
    });
  };

  const makeFilePublic = async (fileName) => {
    return await axios.post("http://localhost:3000/archive/make-file-public", {
      fileName,
    });
  };

  const uploadFile = async (file) => {
    try {
      let elapsedTime = 0;
      const interval = setInterval(() => {
        elapsedTime++;
        console.log(`Elapsed Time: ${elapsedTime} seconds`);
      }, 1000); // Update every second

      const res = await getPreSignedUrl(file.name, file.type);
      await axios.put(res.data.data, file);
      const uploadedFile = await makeFilePublic(file.name);
      clearInterval(interval);
      console.log(`Total Upload Time: ${elapsedTime} seconds`);
      setFileType(file.type);
      setUploadedFileUrl(uploadedFile.data.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

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
      App
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
      {uploadedFileUrl && filePreview(fileType, uploadedFileUrl)}
    </div>
  );
};

export default App;
