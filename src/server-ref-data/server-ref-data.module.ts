import { Module } from '@nestjs/common';
import { ServerRefDataController } from './server-ref-data.controller';
import { ServerRefDataService } from './server-ref-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerPermissionRepository } from './server-permission.repository';
import { CodecRepository } from './codec.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerPermissionRepository, CodecRepository]),
  ],
  controllers: [ServerRefDataController],
  providers: [ServerRefDataService],
  exports: [ServerRefDataService],
})
export class ServerRefDataModule {}
