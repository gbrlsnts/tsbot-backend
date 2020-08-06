import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ServerGroup } from '../../../server-groups/server-group.entity';
import { GroupCategory } from './group-category.entity';

@Entity()
@Unique('uniq_group_cat', ['groupId', 'categoryId'])
export class GroupConfig {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  groupId: number;

  @Column({
    unsigned: true,
  })
  @Expose()
  categoryId: number;

  @OneToOne(
    () => ServerGroup,
    group => group.config,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'groupId' })
  @Expose()
  group: ServerGroup;

  @ManyToOne(
    () => GroupCategory,
    cat => cat.configs,
  )
  @Expose()
  category: GroupCategory;
}
