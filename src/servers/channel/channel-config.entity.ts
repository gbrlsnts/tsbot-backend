import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChannelConfig {
  @PrimaryGeneratedColumn()
  id: number;
}