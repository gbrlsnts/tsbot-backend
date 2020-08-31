import { Length, ArrayNotEmpty } from 'class-validator';

export class ChannelDto {
  @Length(2, 28)
  name: string;

  @Length(4, 100)
  password: string;

  @ArrayNotEmpty()
  @Length(2, 28, {
    each: true,
  })
  subchannels: string[];
}
