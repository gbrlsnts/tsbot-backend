import { Injectable } from '@nestjs/common';
import { ServerPermission } from './server-permission.entity';
import { Codec } from './codec.entity';

@Injectable()
export class ServerRefDataService {
  getAllPermissions(): Promise<ServerPermission[]> {
    return ServerPermission.find();
  }

  getAllCodecs(): Promise<Codec[]> {
    return Codec.find();
  }
}
