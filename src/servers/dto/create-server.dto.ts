import { TeamspeakConnectionProtocol } from '../server.types';

export class CreateServerDto {
  serverName: string;
  host: string;
  serverPort: number;
  queryPort: number;
  botName: string;
  protocol: TeamspeakConnectionProtocol;
  username: string;
  password: string;
}
