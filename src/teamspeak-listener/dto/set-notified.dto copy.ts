import { IsPositive } from 'class-validator';

export class GetInactiveChannelByIdDto {
  @IsPositive()
  channelId: number;
}
