import { TeamspeakConnectionProtocol } from '../server.types';
import { Exclude } from 'class-transformer';

export class ServerConfigDto {
  host: string;
  serverPort: number;
  queryPort: number;
  botName: string;
  protocol: TeamspeakConnectionProtocol;
  username: string;

  @Exclude()
  password: string;

  /**
   * Initialize this dto with data
   * @param init properties to initialize the dto with
   */
  constructor(init?: Partial<ServerConfigDto>) {
    Object.assign(this, init);
  }

  /**
   * Merge data with another dto. password is only merged if it contains non-empty values.
   * @param otherDto new dto to apply
   * @returns merged dto
   */
  merge(otherDto: ServerConfigDto): ServerConfigDto {
    const newDto = new ServerConfigDto();

    newDto.host = otherDto.host || this.host;
    newDto.serverPort = otherDto.serverPort || this.serverPort;
    newDto.queryPort = otherDto.queryPort || this.queryPort;
    newDto.botName = otherDto.botName || this.botName;
    newDto.protocol = otherDto.protocol || this.protocol;
    newDto.username = otherDto.username || this.username;
    newDto.password =
      otherDto.password && otherDto.password.length > 0
        ? otherDto.password
        : this.password;

    return newDto;
  }

  /**
   * Get an instance of this dto without the password field
   */
  withoutPassword(): ServerConfigDto {
    const newDto = new ServerConfigDto(this);

    delete newDto.password;

    return newDto;
  }
}
