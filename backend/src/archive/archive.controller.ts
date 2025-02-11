import { Body, Controller, Post } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { CreatePresignedUrlDto } from './validators/create-presigned-url.dto';
import { CompleteFileUploadDto } from './validators/complete-file-upload.dto';

@Controller('archive')
export class ArchiveController {
  constructor(private archiveService: ArchiveService) {}

  @Post('/presigned-url')
  async createPreSignedUrl(@Body() body: CreatePresignedUrlDto) {
    try {
      return await this.archiveService.createPreSignedUrl(
        body.fileName,
        body.totalChunks,
      );
    } catch (error) {
      throw new Error('Problem creating pre-signed URL');
    }
  }

  @Post('/complete-upload')
  async completeUpload(@Body() body: CompleteFileUploadDto) {
    try {
      return await this.archiveService.completeMultipartUpload(
        body.fileName,
        body.uploadId,
        body.parts,
      );
    } catch (error) {
      throw new Error('Failed to complete multipart upload.');
    }
  }
}
