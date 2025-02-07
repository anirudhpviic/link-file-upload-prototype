import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ArchiveModule } from './archive/archive.module';
import { CoreModule } from './core/module';

@Module({
  imports: [
    CoreModule,
    ConfigModule.forRoot(),
    ArchiveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
