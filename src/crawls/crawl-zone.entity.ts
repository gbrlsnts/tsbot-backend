import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Crawl } from "./crawl.entity";
import { Zone } from '../servers/configs/zone/zone.entity';

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

  @ManyToOne(() => Crawl, crawl => crawl.zones, {
    onDelete: 'CASCADE',
  })
  crawl: Crawl;

  @ManyToOne(() => Zone, {
    onDelete: 'CASCADE',
  })
  zone: Zone;
}