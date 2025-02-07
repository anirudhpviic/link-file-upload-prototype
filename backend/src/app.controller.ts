import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AWSService } from './core/aws/aws.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly awsService: AWSService,
  ) {}

  @Get('/')
  async check() {
    return `Server Up And Running On Port ${process.env.PORT}`;
  }

  @Post('/upload')
  @UseInterceptors(FilesInterceptor)
  @FormDataRequest({ storage: MemoryStoredFile })
  async upload(@Body() body) {
    console.log('body:', body);
    const preSignedUrl = await this.awsService.getPresignedUrl(
      body.file.originalName,
      body.file.mimetype,
    );
    console.log('result:', preSignedUrl);

    // const response = await fetch(preSignedUrl, {
    //   method: 'PUT',
    //   body: body.file.buffer, // The file object to upload
    //   headers: {
    //     'Content-Type': body.file.type, // Optional: Set the correct MIME type
    //   },
    // });

    // console.log("response:", response);

    // const responseUrl = response.url.split('?')[0]; // Remove query parameters
    // console.log(responseUrl);

    // console.log('response:', response);

    // const makePublic = await this.awsService.makeFilePublic(
    //   body.file.originalName,
    // );

    // console.log('makePublic:', makePublic);
    return { preSignedUrl };
  }

  @Post('make-public')
  async makePublic(@Body() body) {
    const makePublic = await this.awsService.makeFilePublic(body.fileName);
    return { makePublic };
  }

}
