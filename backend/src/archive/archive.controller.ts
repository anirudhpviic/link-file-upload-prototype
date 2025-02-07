import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ArchiveService } from './archive.service';

@Controller('archive')
export class ArchiveController {
  constructor(private archiveService: ArchiveService) {}

  @Post('/presigned-url')
  async upload(@Body() body) {
    console.log('body:', body);
    try {
      return await this.archiveService.createPreSignedUrl(
        body.fileName,
        body.fileType,
      );
    } catch (error) {
      console.error('Error creating pre-signed URL:', error);
      throw new Error('Problem creating pre-signed URL');
    }
  }

  @Post('/make-file-public')
  async makePublic(@Body() body) {
    try {
      return await this.archiveService.makeFilePublic(body.fileName);
    } catch (error) {
      console.error('Error making file public:', error);
      throw new Error('Failed to update file permissions.');
    }
  }
}
