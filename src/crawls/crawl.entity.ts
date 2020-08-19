import { Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { CrawlZone } from './crawl-zone.entity';

@Entity()
export class Crawl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  runAt: Date;

  @OneToMany(() => CrawlZone, zone => zone.crawl)
  zones: CrawlZone[];
}