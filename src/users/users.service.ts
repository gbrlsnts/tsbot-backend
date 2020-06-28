import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

const safeColumns: (keyof User)[] = ['id', 'email'];

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
    return this.usersRepository.find({
      select: safeColumns,
    });
  }

  /**
   * Get an user by id
   * @param id user id
   */
  async getUserById(id: number, allColumns = false): Promise<User> {
    const user = await this.usersRepository.findOne({
      select: !allColumns ? safeColumns: undefined,
      where: { id },
    });

    if (!user) throw new NotFoundException();

    return user;
  }

  /**
   * Get an user by id
   * @param id user id
   */
  async getUserByEmail(email: string, allColumns = false): Promise<User> {
    const user = await this.usersRepository.findOne({
      select: !allColumns ? safeColumns: undefined,
      where: { email },
    });

    if (!user) throw new NotFoundException();

    return user;
  }

  /**a
   * Update an user email
   * @param id user id
   * @param dto data to update email
   */
  async updateEmail(id: number, dto: UpdateEmailDto): Promise<void> {
    const user = await this.getUserById(id);

    user.email = dto.email;

    await this.usersRepository.save(user);
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
