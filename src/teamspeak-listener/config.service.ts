import { Injectable } from '@nestjs/common';
import { Configuration, CrawlerConfiguration } from '../teamspeak/types/server';
import { ServersConfigService } from '../servers/configs/server/servers-config.service';
import { ServerConfig } from '../servers/configs/server/server-config.entity';
import { ConfigCommonService } from '../teamspeak-common/config-common.service';

@Injectable()
export class ConfigListenerService {
  constructor(
    private readonly serverConfigService: ServersConfigService,
    private readonly tsConfigCommonService: ConfigCommonService,
  ) {}

  /**
   * Get a server configuration for the bot
   * @param serverId
   */
  async getServerConfig(serverId: number): Promise<Configuration> {
    const serverConfig = await this.serverConfigService.getServerConfigById(
      serverId,
    );

    const crawlerConfig = await this.tsConfigCommonService.getCrawlerConfiguration(
      serverId,
    );

    return this.buildConfiguration(serverId, serverConfig, crawlerConfig);
  }

  /**
   * Set the connection error flag
   * @param serverId
   * @param error
   */
  setConnectionError(serverId: number, error: boolean): Promise<void> {
    return this.serverConfigService.setConnectionErrorFlag(serverId, error);
  }

  /**
   * Build the configuration object
   * @param serverId
   * @param serverConfig
   * @param crawlerConfig
   */
  private buildConfiguration(
    serverId: number,
    serverConfig: ServerConfig,
    crawlerConfig: CrawlerConfiguration,
  ): Configuration {
    const {
      host,
      queryPort: queryport,
      serverPort: serverport,
      protocol,
      username,
      password,
      botName: nickname,
    } = serverConfig.config;

    const config: Configuration = {
      id: serverId,
      connection: {
        host,
        queryport,
        serverport,
        protocol,
        username,
        password,
        nickname,
      },
    };

    if (crawlerConfig.zones.length > 0) {
      config.crawler = crawlerConfig;
    }

    return config;
  }
}
