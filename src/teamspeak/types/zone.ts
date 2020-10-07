export interface CrawlZone {
  /** Zone name */
  name: string;
  /** Flag for when the zone is configured to have a spacer as separator between zones */
  spacerAsSeparator: boolean;
  /** Zone start channel Id */
  start: number;
  /** Zone end channel Id */
  end: number;
  /** Icon name for inactive channels */
  inactiveIcon?: number;
  /** Time in seconds a channel can be inactive before triggering a notification */
  timeInactiveNotify: number;
  /** Time in seconds a channel can be inactive before it is deleted */
  timeInactiveMax: number;
}
