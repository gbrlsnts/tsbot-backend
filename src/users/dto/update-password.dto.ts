import { IsString, MinLength, Matches } from 'class-validator';
import { passwordRegex } from '../../shared/constants';
import { passwordWeak } from '../../shared/messages/user.messages';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @Matches(passwordRegex, {
    message: passwordWeak,
  })
  password: string;
}
