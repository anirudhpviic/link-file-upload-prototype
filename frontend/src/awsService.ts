import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";

const s3Client1 = new S3Client({
  endpoint: "https://blr1.digitaloceanspaces.com",
  region: "ap-south-1",
  credentials: {
    accessKeyId: "JXI44KECR3GGBFJBO772",
    secretAccessKey: "5kQf8695DTdTPmjPooDAanoyHu7mFFAjga98psb7z/o"
  },
});

export const makeFilePublic = async (fileName) => {
  console.log(fileName);
  try {
    const command = new PutObjectAclCommand({
      Bucket: "assets-link",
      Key: fileName,
      ACL: "public-read",
    });

    await s3Client1.send(command);
    return;
    // return `https://assets-link.ap-south-1.digitaloceanspaces.com/${fileName}`;
  } catch (error) {
    console.error("Error making file public:", error);
    throw new Error("Failed to update file permissions.");
  }
};
