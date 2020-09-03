import { Length, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { UserChannelConfiguration } from 'src/teamspeak/types/user-channel';

export class SubChannelDto {
  @Length(4, 100)
  password: string;

  @ArrayNotEmpty()
  @ArrayUnique()
  @Length(2, 28, {
    each: true,
  })
  subchannels: string[];

  toBotChannel(): UserChannelConfiguration[] {
    return this.subchannels.map(name => ({
      name: name,
      password: this.password,
      channels: [],
    }));
  }
}
