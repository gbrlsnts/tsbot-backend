import { IsString, MinLength, Matches } from 'class-validator';
import { passwordRegex } from '../../constants';
import { passwordWeak } from '../../messages/user.messages';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @Matches(passwordRegex, {
    message: passwordWeak,
  })
  password: string;
}
