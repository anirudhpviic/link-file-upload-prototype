import { Module } from '@nestjs/common';
import { ArchiveController } from './archive.controller';
import { ArchiveService } from './archive.service';
import { CoreModule } from 'src/core/module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CoreModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: { attempts: 3, backoff: 2000, removeOnComplete: true },
    }),
    BullModule.registerQueue({
      name: 'file-upload-queue',
    }),
  ],
  controllers: [ArchiveController],
  providers: [ArchiveService],
})
export class ArchiveModule {}
