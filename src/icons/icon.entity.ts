import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToOne,
} from 'typeorm';
import { IconContent } from './icon-content.entity';

@Entity()
@Unique('uniq_server_icon', ['tsId', 'serverId'])
export class Icon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tsId: number;

  @Column()
  serverId: number;

  @Column()
  originalName: string;

  @Column()
  extension: string;

  @OneToOne(
    () => IconContent,
    content => content.icon,
  )
  data: IconContent;
}
