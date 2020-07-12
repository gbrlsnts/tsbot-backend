import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as messages from '../messages/user.messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private usersRepository: UserRepository,
  ) {}

  /**
   * Get all users
   */
  getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Get an user by id
   * @param id user id
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException();

    return user;
  }

  /**
   * Get an user by id
   * @param id user id
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) throw new NotFoundException();

    return user;
  }

  /**
   * Check if an email already exists
   * @param email email to check
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const count = await this.usersRepository.count({
      where: { email },
    });

    return count > 0;
  }

  /**a
   * Update an user email
   * @param id user id
   * @param dto data to update email
   */
  async updateEmail(id: number, dto: UpdateEmailDto): Promise<User> {
    const user = await this.getUserById(id);

    const emailExists = await this.checkEmailExists(dto.email);

    if (emailExists) throw new ConflictException(messages.emailExists);

    user.email = dto.email;

    return this.usersRepository.save(user);
  }

  /**
   * Update an user password
   * @param id user id
   * @param dto data to update email
   */
  async updatePassword(id: number, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.getUserById(id);

    await user.setHashedPassword(dto.password);

    await this.usersRepository.save(user);
  }

  /**
   * Create an user in the app
   * @param dto credentials to create the user
   */
  createUser(dto: UserCredentialsDto): Promise<number> {
    return this.usersRepository.createUser(dto);
  }
}
