import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Server } from 'src/servers/server.entity';
import { Icon } from 'src/icons/icon.entity';

export abstract class TsGroup {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  tsId: number;

  @Column({
    unsigned: true,
  })
  serverId: number;

  @Column({
    nullable: true,
    type: 'uuid',
  })
  @Expose()
  iconId: string;

  @Column({
    nullable: true,
  })
  @Expose()
  localIconId: number;

  @Column()
  @Expose()
  name: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(
    () => Server,
    server => server.serverGroups,
  )
  server: Server;

  @ManyToOne(() => Icon, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'iconId' })
  icon: Icon;

  @Expose()
  active(): boolean {
    return !(this.deletedAt !== undefined && this.deletedAt !== null);
  }
}
