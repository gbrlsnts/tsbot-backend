import { Entity, PrimaryColumn, Column } from "typeorm";

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
}