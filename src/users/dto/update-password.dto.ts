import { IsString, MinLength, Matches } from "class-validator";
import { passwordRegex } from "src/constants";

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @Matches(passwordRegex, {
      message: 'password too weak'
  })
  password: string;
}
