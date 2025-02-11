import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/core/aws/aws.service';

@Injectable()
export class ArchiveService {
  constructor(private awsService: AWSService) {}

  createPreSignedUrl = async (fileName: string, totalChunks: number) => {
    return await this.awsService.getMultiplePresignedUrls(
      fileName,
      totalChunks,
    );
  };

  completeMultipartUpload = async (
    fileName: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
  ) => {
    return await this.awsService.completeMultipartUpload(
      fileName,
      uploadId,
      parts,
    );
  };

  makeFilePublic = async (fileName: string) => {
    return await this.awsService.makeFilePublic(fileName);
  };
}
