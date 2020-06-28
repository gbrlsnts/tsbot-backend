import { User } from './user.entity';

export interface UsersListResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}
