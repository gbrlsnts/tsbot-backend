import { Module } from '@nestjs/common';
import { CrawlsService } from './crawls.service';

@Module({
  providers: [CrawlsService],
  exports: [CrawlsService],
})
export class CrawlsModule {}
