import { TeamspeakConnectionProtocol } from '../../servers/server.types';
import { CrawlZone } from './zone';

export interface Configuration {
  /** server identifier, should be unique */
  id: number;
  /** Server connection configurations */
  connection: ConnectionConfiguration;

  /** Crawler configurations */
  crawler?: CrawlerConfiguration;
}

export interface ConnectionConfiguration {
  /** Host to connect to */
  host: string;
  /** Query port */
  queryport: number;
  /** Voice port */
  serverport: number;
  /** Query protocol */
  protocol: TeamspeakConnectionProtocol;
  /** Username to login with */
  username?: string;
  /** Password to use in login */
  password?: string;
  /** Nickname of the bot */
  nickname: string;
}

export interface CrawlerConfiguration {
  /** Interval in seconds that the bot should crawl the server */
  interval: number;
  /** A list of zones with user channels that should be monitored */
  zones: CrawlZone[];
}
