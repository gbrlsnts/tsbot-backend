import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../../users/user.entity';

@Injectable()
export class LoggedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    const argId = Number(req.params.id);

    if (!user || !argId) return false;

    return user.isAdmin || user.id === argId;
  }
}
