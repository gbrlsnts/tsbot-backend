import { TeamspeakConnectionProtocol } from '../server.types';
import {
  MinLength,
  MaxLength,
  IsPort,
  IsIn,
  IsOptional,
} from 'class-validator';
import { IsFqdnOrIp } from '../validation/fqdn-ip.validation';

export class UpdateServerDto {
  @MinLength(2)
  @MaxLength(20)
  @IsOptional()
  serverName: string;

  @IsFqdnOrIp()
  @IsOptional()
  host: string;

  @IsPort()
  @IsOptional()
  serverPort: number;

  @IsPort()
  @IsOptional()
  queryPort: number;

  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  botName: string;

  @IsIn(Object.values(TeamspeakConnectionProtocol))
  @IsOptional()
  protocol: TeamspeakConnectionProtocol;

  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  username: string;

  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  password: string;
}
