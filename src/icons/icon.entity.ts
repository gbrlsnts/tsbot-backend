import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  AfterLoad,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IconContent } from './icon-content.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique('uniq_server_icon', ['serverId', 'tsId'])
export class Icon {
  static localIcons = [100, 200, 300, 400, 500, 600];

  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({
    type: 'bigint',
  })
  @Expose()
  tsId: number;

  @Column()
  @Expose()
  serverId: number;

  @Column()
  @Expose()
  mime: string;

  @Column({
    nullable: true,
  })
  uploadedById: number;

  @CreateDateColumn()
  @Expose()
  uploadedAt: Date;

  @OneToOne(
    () => IconContent,
    content => content.icon,
    { cascade: ['insert'] },
  )
  data: IconContent;

  @ManyToOne(() => User)
  uploadedBy?: User;

  @AfterLoad()
  initConfigDto(): void {
    // tsId will never be more than an unsigned 32bit
    this.tsId = Number(this.tsId);
  }

  /**
   * Check if an icon ID is a local icon
   * @param id icon id to check
   */
  static isLocal(id: number): boolean {
    return Icon.localIcons.includes(id);
  }
}
