import { IsEmail, IsString, MinLength, Matches } from "class-validator";
import { passwordRegex } from '../../constants';

export class UserCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(passwordRegex, {
      message: 'password too weak'
  })
  password: string;
}
