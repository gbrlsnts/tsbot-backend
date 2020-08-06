import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Icon } from './icon.entity';

@Entity()
export class IconContent {
  @PrimaryColumn('uuid')
  id: string;

  @Column('bytea')
  content: ArrayBuffer;

  @OneToOne(
    () => Icon,
    icon => icon.data,
    {
      primary: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'id' })
  icon: Icon;
}
