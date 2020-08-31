import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity()
export class ServerPermission {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  permid: string;

  @Column()
  @Expose()
  name: string;
}
