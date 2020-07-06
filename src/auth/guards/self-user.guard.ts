import { CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/user.entity';

export class LoggedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    const argId = Number(req.params.id);

    if (!user || !argId) return false;

    return user.id === argId;
  }
}
