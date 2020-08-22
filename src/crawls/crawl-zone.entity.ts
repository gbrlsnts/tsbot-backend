import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Crawl } from './crawl.entity';
import { Zone } from '../servers/configs/zone/zone.entity';
import { Expose } from 'class-transformer';

@Entity()
export class CrawlZone {
  @PrimaryColumn()
  crawlId: string;

  @PrimaryColumn()
  zoneId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  inactiveChannels: number;

  @Column({
    unsigned: true,
    default: 0,
  })
  @Expose()
  deletedChannels: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  totalChannels: number;

  @ManyToOne(
    () => Crawl,
    crawl => crawl.zones,
    {
      onDelete: 'CASCADE',
    },
  )
  crawl: Crawl;

  @ManyToOne(() => Zone, {
    onDelete: 'CASCADE',
  })
  zone: Zone;
}
