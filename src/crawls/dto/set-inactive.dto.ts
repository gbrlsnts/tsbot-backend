import { InactiveChannelDto } from './inactive-channel.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SetInactiveChannelsDto {
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => InactiveChannelDto)
  channels: InactiveChannelDto[];
}
