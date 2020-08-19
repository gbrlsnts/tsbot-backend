import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Crawl } from "./crawl.entity";

@Entity()
export class CrawlZone {
  @PrimaryColumn()
  crawlId: string;

  @PrimaryColumn()
  zoneId: number;

  @Column({
    unsigned: true,
  })
  inactiveChannels: number;

  @Column({
    unsigned: true,
  })
  totalChannels: number;

  @ManyToOne(() => Crawl, crawl => crawl.zones)
  crawl: Crawl;
}