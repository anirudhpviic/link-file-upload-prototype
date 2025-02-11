import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { FileUploadWorker } from './file-upload.worker';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: { attempts: 3, backoff: 2000, removeOnComplete: true },
    }),
    BullModule.registerQueue({
      name: 'file-upload-queue',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, FileUploadWorker],
})
export class AppModule {}
 