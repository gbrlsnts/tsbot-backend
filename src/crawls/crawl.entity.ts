import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { CrawlZone } from './crawl-zone.entity';

@Entity()
export class Crawl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  runAt: Date;

  @OneToMany(
    () => CrawlZone,
    zone => zone.crawl,
  )
  zones: CrawlZone[];
}
