import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../../users/user.entity';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    return user.isAdmin;
  }
}
