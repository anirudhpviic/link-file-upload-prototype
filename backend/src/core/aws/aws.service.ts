// import { Injectable } from '@nestjs/common';
// import * as AWS from 'aws-sdk';

// @Injectable()
// export class S3Service {
//   private s3: AWS.S3;

//   constructor() {
//     this.s3 = new AWS.S3({
//       endpoint: process.env.SPACES_ENDPOINT,
//       accessKeyId: process.env.SPACES_KEY,
//       secretAccessKey: process.env.SPACES_SECRET,
//       signatureVersion: 'v4',
//     });
//   }

//   async getPreSignedUrl(file) {
//     try {
//       const params = {
//         Bucket: process.env.SPACES_BUCKET,
//         Key: file.originalName,
//         Expires: 300, // URL valid for 5 minutes
//         ContentType: file.mimetype,
//         ACL: 'public-read', // Make it publicly accessible
//       };

//       return this.s3.getSignedUrlPromise('putObject', params);
//     } catch (error) {
//         console.error('Error generating pre-signed URL:', error);
//     }
//   }
// }

// import { S3 } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';
// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';

// @Injectable()
// export class AWSService {
//   s3: S3;
//   constructor() {
//     this.s3 = new S3({
//       apiVersion: '2006-03-01',
//       endpoint: process.env.SPACES_ENDPOINT,
//       region: process.env.SPACES_REGION,
//       credentials: {
//         accessKeyId: process.env.SPACES_KEY,
//         secretAccessKey: process.env.SPACES_SECRET,
//       },
//     });
//   }

//   getPreSignedUrl = async (file) => {
//     try {
//       const uploadToS3 = new Upload({
//         client: this.s3,
//         queueSize: 4,
//         partSize: 10485760,
//         params: {
//           ACL: 'public-read',
//           Bucket: process.env.SPACES_BUCKET,
//           Key: file.originalname,
//           Body: file.buffer,
//         },
//       });
//       const data = await uploadToS3.done();
//       return data.Location;
//     } catch (error) {
//       console.log(error);
//       throw new Error('Problem In Uploading To S3!');
//     }
//   };
// }

// import { S3 } from '@aws-sdk/client-s3';
// import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
// import { Injectable } from '@nestjs/common';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Import the getSignedUrl function

// @Injectable()
// export class AWSService {
//   private s3: S3;

//   constructor() {
//     this.s3 = new S3({
//       apiVersion: '2006-03-01',
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
//         ACL: 'public-read', // Set public-read if you want the file to be accessible after upload
//       });

//       // Use the getSignedUrl function to generate the pre-signed URL
//       const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // Expires in 1 hour

//       return signedUrl;
//     } catch (error) {
//       console.error('Error generating pre-signed URL:', error);
//       throw new Error('Problem generating pre-signed URL');
//     }
//   }
// }

import { S3, PutObjectCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
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

  async getPresignedUrl(fileName: string, fileType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key: fileName,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 50000,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error('Problem generating pre-signed URL');
    }
  }

  async makeFilePublic(fileName: string) {
    try {
      const command = new PutObjectAclCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key: fileName,
        ACL: 'public-read',
      });

      await this.s3.send(command);
      return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
    } catch (error) {
      console.error('Error making file public:', error);
      throw new Error('Failed to update file permissions.');
    }
  }

  // async makeFilePublic(fileName: string): Promise<string> {
  //   try {
  //     const command = new PutObjectAclCommand({
  //       Bucket: process.env.SPACES_BUCKET,
  //       Key: fileName,
  //       ACL: 'public-read',
  //     });

  //     await this.s3.send(command);

  //     // ✅ Ensure this returns a valid URL
  //     return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
  //   } catch (error) {
  //     console.error('Error making file public:', error);
  //     throw new Error('Failed to update file permissions.');
  //   }
  // }
}
