import {
  Controller,
  Param,
  ParseIntPipe,
  Body,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { BadgesService } from './badges.service';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { User } from '../users/user.entity';
import { SetBadgesDto } from './dto/set-badges.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ServerRolesGuard,
  ServerRoles,
} from '../servers/guards/server-roles.guard';
import { SetServerRoles } from '../servers/decorators/set-server-roles.decorator';
import { appSerializeOptions } from '../shared/constants';

@Controller('/servers/:server/badges')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER, ServerRoles.CLIENT])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Put('/me')
  setUserBadges(
    @GetUser() user: User,
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: SetBadgesDto,
  ): Promise<void> {
    return this.badgesService.setUserBadges(user, serverId, dto);
  }
}
