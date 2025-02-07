// import React, { useEffect } from "react";

// const App = () => {
//   const preSignedUrl =
//     "https://assets-link.blr1.digitaloceanspaces.com/qrCode-monitor123.png?Content-Type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T113700Z&X-Amz-Expires=300&X-Amz-Signature=057cbcd6e6a2b120d2c091eaa14c8ae548adfba9105a6a01870327a34549c8d5&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-amz-acl=public-read";
//   const uploadFile = async (file) => {
//     console.log("file:", file);
//     const response = await fetch(preSignedUrl, {
//       method: "PUT",
//       body: file, // The file object to upload
//       headers: {
//         "Content-Type": file.type, // Optional: Set the correct MIME type
//       },
//     });

//     console.log("response:", response);

//     if (response.ok) {
//       console.log("File uploaded successfully!");
//     } else {
//       console.error("File upload failed");
//     }
//   };

//   return (
//     <div>
//       App
//       <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
//     </div>
//   );
// };

// export default App;

import React from "react";
import axios from "axios";
import { makeFilePublic } from "./awsService";

const App = () => {
  const handleMakePublic = async () => {
    try {
      const publicUrl = await makeFilePublic("example-video.mp4");
      console.log("File is now public at:", publicUrl);
    } catch (error) {
      console.error(error);
    }
  };

  // const preSignedUrl =
  //   "https://assets-link.blr1.digitaloceanspaces.com/qrCode-monitor123.png?Content-Type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T122337Z&X-Amz-Expires=300&X-Amz-Signature=a8a08e09789d62fb8936c58e8bbf7d578cefc09fa15f11c795c133e79e1f84c3&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-amz-acl=public-read";

  // const uploadFile = (file) => {
  //   console.log("file:", file);
  //   const xhr = new XMLHttpRequest();
  //   xhr.open("PUT", preSignedUrl, true);
  //   xhr.setRequestHeader("Content-Type", file.type);

  //   xhr.onload = function () {
  //     console.log("xhr.response:", xhr.response);
  //     if (xhr.status >= 200 && xhr.status < 300) {
  //       console.log("File uploaded successfully!");
  //     } else {
  //       console.error("File upload failed", xhr.responseText);
  //     }
  //   };

  //   xhr.onerror = function () {
  //     console.error("Request failed");
  //   };

  //   xhr.send(file);
  // };

  const uploadFile = async (file) => {
    console.log("file:", file);
    const preSignedUrl =
    "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250207%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250207T054631Z&X-Amz-Expires=50000&X-Amz-Signature=b969bd3ed25cc6c9214288be99c89a7aeb9d7d068bf42de12f7b1b01a5064dd8&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250207%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250207T054631Z&X-Amz-Expires=50000&X-Amz-Signature=b969bd3ed25cc6c9214288be99c89a7aeb9d7d068bf42de12f7b1b01a5064dd8&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T145143Z&X-Amz-Expires=50000&X-Amz-Signature=375ea0ca11193ca0e9c853ba3808e8d768e33036afacd4935321ab5e61ae5a3a&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
      // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T144711Z&X-Amz-Expires=50000&X-Amz-Signature=b27f40330f47898744f89e45cd8e5e1dd667af65b8fa4a91192a75bedd5bcebf&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject";
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T142925Z&X-Amz-Expires=50000&X-Amz-Signature=619cba53fe314b85bd6b7a67157c3c65d02f846e15b2013c5ff5a9a51a6a229f&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T142235Z&X-Amz-Expires=50000&X-Amz-Signature=4580e181399baf6656bf52611383ae0228906c783b1b8be66b32ce53925589c1&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject";
    // "https://assets-link.blr1.digitaloceanspaces.com/front-left-side-47.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T135900Z&X-Amz-Expires=50000&X-Amz-Signature=00f24b263f445cd7b6311374d94ae5e2eafb072e79784dfa7f06acfac9d47d1c&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject";
    // "https://assets-link.blr1.digitaloceanspaces.com/front-left-side-47.avif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=JXI44KECR3GGBFJBO772%2F20250206%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250206T135421Z&X-Amz-Expires=50000&X-Amz-Signature=ec38ba7d11d12dc844b6948d49ea9c6a0e1de45eff6188a587984089d72ca076&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject";

    // "https://assets-link.blr1.digitaloceanspaces.com/front-left-side-47.avif"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg"
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg";
    // "https://assets-link.blr1.digitaloceanspaces.com/photo-1704340142770-b52988e5b6eb.jpeg";
    try {
      // const response = await fetch(preSignedUrl, {
      //   method: "PUT",
      //   body: file, // The file object to upload
      //   headers: {
      //     "Content-Type": file.type || "application/octet-stream", // Ensure a valid Content-Type
      //     // "Content-Type": file.type, // Optional: Set the correct MIME type
      //   },
      // });

      const response = await axios.put(preSignedUrl, file);

      // const publicUrl = await makeFilePublic(file.name);
      // console.log("File is now public at:", publicUrl);

      console.log("response:", response);
    } catch (error) {
      console.log("Error:", error);
    }

    // const makePublic = await this.awsService.makeFilePublic(
    //   body.file.originalName
    // );

    // console.log("makePublic:", makePublic);
  };

  // const getPublicUrl = async () => {
  //   const response = await fetch(
  //     //   "https://assets-link.blr1.digitaloceanspaces.com/SampleVideo_1280x720_1mb-1711124336897-0.mp4"
  //     "https://assets-link.ap-south-1.digitaloceanspaces.com/SampleVideo_1280x720_1mb-1711124336897-0.mp4"
  //   );
  //   const url = await response.text(); // ✅ Ensure correct format
  //   console.log(url); // Should print: https://your-space-name.region.digitaloceanspaces.com/my-video.mp4
  // };

  return (
    <div>
      App
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
      {/* <button onClick={getPublicUrl}>Get Public URL</button> */}
    </div>
  );
};

export default App;
