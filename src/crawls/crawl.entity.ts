import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { CrawlZone } from './crawl-zone.entity';
import { Expose } from 'class-transformer';
import { Server } from '../servers/server.entity';

@Entity()
export class Crawl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Expose()
  runAt: Date;

  @Column()
  @Index()
  serverId: number;

  @OneToMany(
    () => CrawlZone,
    zone => zone.crawl,
    { cascade: true },
  )
  @Expose()
  zones: CrawlZone[];

  @ManyToOne(() => Server, {
    onDelete: 'CASCADE',
  })
  server: Server;
}
