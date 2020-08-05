import { Controller, Get } from '@nestjs/common';
import { ServerPermission } from './server-permission.entity';
import { MetadataService } from './metadata.service';
import { Codec } from './codec.entity';

@Controller('metadata')
export class MetadataController {
  constructor(private refDataService: MetadataService) {}

  @Get('/server-permissions')
  getAllPermissions(): Promise<ServerPermission[]> {
    return this.refDataService.getAllPermissions();
  }

  @Get('/codecs')
  getAllCodecs(): Promise<Codec[]> {
    return this.refDataService.getAllCodecs();
  }
}
