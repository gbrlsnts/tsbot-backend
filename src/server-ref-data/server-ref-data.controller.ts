import { Controller, Get } from '@nestjs/common';
import { ServerPermission } from './server-permission.entity';
import { ServerRefDataService } from './server-ref-data.service';
import { Codec } from './codec.entity';

@Controller('reference')
export class ServerRefDataController {
  constructor(private refDataService: ServerRefDataService) {}

  @Get('/server-permissions')
  getAllPermissions(): Promise<ServerPermission[]> {
    return this.refDataService.getAllPermissions();
  }

  @Get('/codecs')
  getAllCodecs(): Promise<Codec[]> {
    return this.refDataService.getAllCodecs();
  }
}
