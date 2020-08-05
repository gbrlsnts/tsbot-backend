import { Module } from '@nestjs/common';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerPermissionRepository } from './server-permission.repository';
import { CodecRepository } from './codec.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerPermissionRepository, CodecRepository]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
