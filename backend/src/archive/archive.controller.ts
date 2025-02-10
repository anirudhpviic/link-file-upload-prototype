import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { AWSService } from 'src/core/aws/aws.service';

@Controller('archive')
export class ArchiveController {
  constructor(
    private archiveService: ArchiveService,
    // private readonly awsService: AWSService,
  ) {}

  // @Post('/presigned-url')
  // async upload(@Body() body) {
  //   console.log('body:', body);
  //   try {
  //     return await this.archiveService.createPreSignedUrl(
  //       body.fileName,
  //       body.fileType,
  //     );
  //   } catch (error) {
  //     console.error('Error creating pre-signed URL:', error);
  //     throw new Error('Problem creating pre-signed URL');
  //   }
  // }

  // @Post('/make-file-public')
  // async makePublic(@Body() body) {
  //   try {
  //     return await this.archiveService.makeFilePublic(body.fileName);
  //   } catch (error) {
  //     console.error('Error making file public:', error);
  //     throw new Error('Failed to update file permissions.');
  //   }
  // }

    @Post('/presigned-url')
    async presignedUrl(@Body() body) {
      console.log('body chc:', body);
      try {
        return await this.archiveService.createPreSignedUrl(
          body.fileName,
          body.totalChunks,
        );
      } catch (error) {
        console.error('Error creating pre-signed URL:', error);
        throw new Error('Problem creating pre-signed URL');
      }
    }

    @Post('/complete-upload')
    async completeUpload(@Body() body) {
      try {
        await this.archiveService.completeMultipartUpload(
          body.fileName,
          body.uploadId,
          body.parts,
        );

        await this.archiveService.makeFilePublic(body.fileName);
      } catch (error) {
        console.error('Error completing multipart upload:', error);
        throw new Error('Failed to complete multipart upload.');
      }
  }

  // @Get('/cors')
  // async changeCors() {
  //   try {
  //     const res = await this.awsService.setCors();
  //     console.log('cors res:', res);
  //   } catch (error) {
  //     throw new Error(`Failed to set CORS: ${error}`);
  //   }
  // }
}
