import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Crawl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  runAt: Date;
}