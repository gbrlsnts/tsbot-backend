import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IconContent } from './icon-content.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique('uniq_server_icon', ['serverId', 'tsId'])
export class Icon {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  tsId: number;

  @Column()
  @Expose()
  serverId: number;

  @Column()
  @Expose()
  mime: string;

  @Column()
  uploadedById: number;

  @OneToOne(
    () => IconContent,
    content => content.icon,
  )
  data: IconContent;

  @ManyToOne(() => User)
  uploadedBy: User;
}
