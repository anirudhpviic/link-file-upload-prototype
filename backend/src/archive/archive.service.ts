import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/core/aws/aws.service';

@Injectable()
export class ArchiveService {
  constructor(private awsService: AWSService) {}

  createPreSignedUrl = async (fileName: string, fileType: string) => {
    return await this.awsService.getPresignedUrl(fileName, fileType);
  };

  makeFilePublic = async (fileName: string) => {
    return await this.awsService.makeFilePublic(fileName);
  };
}
