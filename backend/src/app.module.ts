import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { AWSService } from './core/aws/aws.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NestjsFormDataModule.config({ storage: MemoryStoredFile }), // Configure global form-data settings
  ],
  controllers: [AppController],
  providers: [AppService, AWSService],
})
export class AppModule {}
