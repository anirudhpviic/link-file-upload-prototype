import { Module } from '@nestjs/common';
import { AWSService } from './aws/aws.service';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    NestjsFormDataModule.config({
      isGlobal: true,
      storage: MemoryStoredFile,
    }),
  ],
  providers: [AWSService],
  exports: [AWSService],
})
export class CoreModule {}
