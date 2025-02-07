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
      return `https://assets-link.blr1.digitaloceanspaces.com/${fileName}`;
    } catch (error) {
      console.error('Error making file public:', error);
      throw new Error('Failed to update file permissions.');
    }
  }
}
