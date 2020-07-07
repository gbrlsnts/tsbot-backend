import { Server } from './server.entity';
import { ServerConfigDto } from './dto/config.dto';

export enum TeamspeakConnectionProtocol {
  RAW = 'RAW',
  SSH = 'SSH',
}

export interface ServersListResponse {
  servers: Server[];
}

export interface ServerResponse {
  server: Server;
}

export interface ServerConfigResponse {
  config: Partial<ServerConfigDto>;
}
