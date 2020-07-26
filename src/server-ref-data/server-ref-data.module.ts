import { Module } from '@nestjs/common';
import { ServerRefDataController } from './server-ref-data.controller';
import { ServerRefDataService } from './server-ref-data.service';

@Module({
  controllers: [ServerRefDataController],
  providers: [ServerRefDataService]
})
export class ServerRefDataModule {}
