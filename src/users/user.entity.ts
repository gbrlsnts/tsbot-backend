import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Server } from '../servers/server.entity';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(
    () => Server,
    server => server.owner,
  )
  servers: Server[];

  /**
   * Set a new hashed password
   * @param password password to set
   */
  async setHashedPassword(password: string): Promise<void> {
    this.password = await this.hashPassword(password);
  }

  /**
   * Validate an unencrypted password against the hashed value
   * @param password unencrypted password
   * @returns true if passwords match
   */
  validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Hash a user password
   * @param password password to hash
   */
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(password, salt);
  }
}
