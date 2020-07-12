import { Request } from 'express';
import { User } from './users/user.entity';

export interface AppRequest extends Request {
  user: User;
}

export enum serializationGroups {
  APP_ADMIN = 'APP_ADMIN',
};