import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('file-upload-queue', { concurrency: 1 })
export class FileUploadWorker extends WorkerHost {
  async process(job: any) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(
      `Job ${job.id} completed ${job.name} ${new Date(job.data.date).toLocaleString()} ${job.data.publicUrl}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log(`Job ${job.id} failed`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Job ${job.id} active`);
  }
}
