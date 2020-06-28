import { Repository, EntityRepository } from 'typeorm';
import { User } from './user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { ConflictException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * Create an user in the database
   * @param dto credentials to create the user
   * @returns user id
   */
  async createUser(dto: UserCredentialsDto): Promise<number> {
    const { email, password } = dto;

    const user = this.create();
    user.email = email;
    await user.setHashedPassword(password);

    try {
      const created = await this.save(user);

      return created.id;
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('Email already exists');

      throw error;
    }
  }
}
