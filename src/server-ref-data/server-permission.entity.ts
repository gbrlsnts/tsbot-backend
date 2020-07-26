import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';

@Entity()
export class ServerPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permid: string;
}
