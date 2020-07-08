import { TeamspeakConnectionProtocol } from '../server.types';
import { MinLength, MaxLength, IsPort, IsIn, IsOptional } from 'class-validator';
import { IsFqdnOrIp } from '../validation/fqdn-ip.validation';

export class ServerDto {
  @MinLength(2)
  @MaxLength(20)
  serverName: string;

  @IsFqdnOrIp()
  host: string;

  @IsPort()
  serverPort: number;

  @IsPort()
  queryPort: number;

  @MinLength(2)
  @MaxLength(30)
  botName: string;

  @IsIn(Object.values(TeamspeakConnectionProtocol))
  protocol: TeamspeakConnectionProtocol;

  @MinLength(1)
  @MaxLength(100)
  username: string;

  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  password: string;
}
