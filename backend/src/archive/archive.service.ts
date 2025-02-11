import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AWSService } from 'src/core/aws/aws.service';

@Injectable()
export class ArchiveService {
  constructor(
    private awsService: AWSService,
    @InjectQueue('file-upload-queue') private readonly fileUploadQueue: Queue,
  ) {}

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
    try {
      await this.awsService.completeMultipartUpload(fileName, uploadId, parts);
      const publicUrl = await this.awsService.makeFilePublic(fileName);
      await this.fileUploadQueue.add(fileName, { publicUrl, date: Date.now() });
      return publicUrl;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
