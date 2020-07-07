import { Server } from './server.entity';

export interface ServerConfigInterface {
  host: string;
  serverPort: number;
  queryPort: number;
  botName: string;
  protocol: TeamspeakConnectionProtocol;
  username: string;
  password: string;
}

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
  config: Partial<ServerConfigInterface>;
}
