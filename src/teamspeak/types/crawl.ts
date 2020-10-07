import { CrawlZone } from './zone';

export interface CrawlerConfiguration {
  /** Interval in seconds that the bot should crawl the server */
  interval: number;
  /** A list of zones with user channels that should be monitored */
  zones: CrawlZone[];
}
