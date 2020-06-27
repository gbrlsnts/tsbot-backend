import { Entity, PrimaryGeneratedColumn, Column, Unique, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from 'bcrypt';

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

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
    validatePassword(password: string): Promise<boolean>
    {
        return bcrypt.compare(password, this.password);
    }

    /**
     * Hash a user password
     * @param password password to hash
     */
    private async hashPassword(password: string)
    {
        const salt = await bcrypt.genSalt();

        return await bcrypt.hash(password, salt);
    }
}