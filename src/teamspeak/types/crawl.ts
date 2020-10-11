import { CrawlZone } from './zone';

export interface CrawlerConfiguration {
  /** Interval in seconds that the bot should crawl the server */
  interval: number;
  /** A list of zones with user channels that should be monitored */
  zones: CrawlZone[];
}

export interface CrawlInfo {
  /** Runtime date of the crawler */
  runAt: Date;
  /** Info on the crawled zones */
  zones: CrawlZoneInfo[];
}

export interface CrawlZoneInfo {
  /** the crawled zone */
  zone: string;
  /** number of inactive channels */
  inactiveChannels: number;
  /** number of deleted channels (included in inactive channels count) */
  deletedChannels: number;
  /** total channels */
  totalChannels: number;
}

export interface CrawlerChannel {
  /** Server channel Id */
  channelId: number;
  /** Time, in seconds, that this channel has been inactive */
  timeInactive: number;
  /** True, if a notification was sent regarding inactivity */
  isNotified?: boolean;
  /** Date of when the channel data was last updated */
  lastUpdated: Date;
}
