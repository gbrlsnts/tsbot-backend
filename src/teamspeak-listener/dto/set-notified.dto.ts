import { IsBoolean, IsPositive } from 'class-validator';

export class SetChannelNotifiedDto {
  @IsPositive()
  channelId: number;

  @IsBoolean()
  notified: boolean;
}
