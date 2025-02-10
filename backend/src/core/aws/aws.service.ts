// import { S3, PutObjectCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
// import { Injectable } from '@nestjs/common';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// @Injectable()
// export class AWSService {
//   private s3: S3;

//   constructor() {
//     this.s3 = new S3({
//       endpoint: process.env.SPACES_ENDPOINT,
//       region: process.env.SPACES_REGION,
//       credentials: {
//         accessKeyId: process.env.SPACES_KEY,
//         secretAccessKey: process.env.SPACES_SECRET,
//       },
//     });
//   }

//   async getPresignedUrl(fileName: string, fileType: string): Promise<string> {
//     try {
//       const command = new PutObjectCommand({
//         Bucket: process.env.SPACES_BUCKET,
//         Key: fileName,
//         ContentType: fileType,
//       });

//       const signedUrl = await getSignedUrl(this.s3, command, {
//         expiresIn: 50000,
//       });

//       return signedUrl;
//     } catch (error) {
//       console.error('Error generating pre-signed URL:', error);
//       throw new Error('Problem generating pre-signed URL');
//     }
//   }

//   async makeFilePublic(fileName: string) {
//     try {
//       const command = new PutObjectAclCommand({
//         Bucket: process.env.SPACES_BUCKET,
//         Key: fileName,
//         ACL: 'public-read',
//       });

//       await this.s3.send(command);
//       return `https://assets-link.blr1.digitaloceanspaces.com/${fileName}`;
//     } catch (error) {
//       console.error('Error making file public:', error);
//       throw new Error('Failed to update file permissions.');
//     }
//   }
// }
// TODO: start
import {
  S3,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectAclCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AWSService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.SPACES_ENDPOINT,
      region: process.env.SPACES_REGION,
      credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
      },
    });
  }

  async getMultiplePresignedUrls(
    fileName: string,
    totalChunks: number,
  ): Promise<{
    uploadId: string;
    preSignedUrls: { partNumber: number; url: string }[];
  }> {
    try {
      // Initiate multipart upload
      const multipartCommand = new CreateMultipartUploadCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key: fileName,
      });

      const multipartUpload = await this.s3.send(multipartCommand);
      const uploadId = multipartUpload.UploadId;

      console.log("uploadId", uploadId);
      console.log("fileName", fileName);
      console.log("totalChunks", totalChunks);

      // Generate pre-signed URLs for each chunk
      const preSignedUrls = [];
      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: process.env.SPACES_BUCKET,
          Key: fileName,
          UploadId: uploadId,
          PartNumber: partNumber,
        });

        const signedUrl = await getSignedUrl(this.s3, uploadPartCommand, {
          expiresIn: 50000,
        }); // 1 hour expiration
        console.log("pre-signed-url:", signedUrl);
        preSignedUrls.push({ partNumber, url: signedUrl });
      }

      return { uploadId, preSignedUrls };
    } catch (error) {
      console.error('Error generating multiple pre-signed URLs:', error);
      throw new Error('Problem generating multiple pre-signed URLs');
    }
  }

  async completeMultipartUpload(
    fileName: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
  ) {
    try {
      console.log("uploadId", uploadId);
      console.log("parts", parts);
      console.log("fileName", fileName);
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      await this.s3.send(completeCommand);

      return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}/${fileName}`;
    } catch (error) {
      console.error('Error completing multipart upload:', error);
      throw new Error('Failed to complete multipart upload.');
    }
  }

  /**
   * Makes the file public after upload
   */
  async makeFilePublic(fileName: string) {
    try {
      const command = new PutObjectAclCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key: fileName,
        ACL: 'public-read',
      });

      await this.s3.send(command);
      return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}/${fileName}`;
    } catch (error) {
      console.error('Error making file public:', error);
      throw new Error('Failed to update file permissions.');
    }
  }
}

// TODO: end

// import { Injectable } from '@nestjs/common';
// import * as AWS from 'aws-sdk';

// @Injectable()
// export class AWSService {
//   private s3: AWS.S3;

//   constructor() {
//     // const spacesEndpoint = new AWS.Endpoint('ams3.digitaloceanspaces.com');
//     this.s3 = new AWS.S3({
//       endpoint: process.env.SPACES_ENDPOINT,
//       accessKeyId: process.env.SPACES_KEY,
//       secretAccessKey: process.env.SPACES_SECRET,
//     });
//   }

//   async setCors(): Promise<void> {
//     console.log("reaching")
//     try {
//       await this.s3
//         .putBucketCors({
//           Bucket: process.env.SPACES_BUCKET,
//           CORSConfiguration: {
//             CORSRules: [
//               {
//                 AllowedOrigins: ['*'],
//                 AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
//                 AllowedHeaders: ['*'],
//                 ExposeHeaders: ['ETag'],
//               },
//             ],
//           },
//         })
//         .promise();
//     } catch (error) {
//       throw new Error(`Failed to set CORS: ${error}`);
//     }
//   }
// }
