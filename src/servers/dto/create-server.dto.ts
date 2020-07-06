import { TeamspeakConnectionProtocol } from '../server.types';

export class CreateServerDto {
  name: string;
  host: string;
  serverPort: number;
  queryPort: number;
  botName: string;
  protocol: TeamspeakConnectionProtocol;
  username: string;
  password: string;
}
