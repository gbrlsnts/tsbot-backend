import { IsPositive, IsBoolean, IsOptional, IsString, IsNotEmpty } from "class-validator";

export class ZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  channelIdStart: number;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  channelIdEnd: number;

  @IsBoolean()
  @IsOptional({
    groups: ['patch']
  })
  separator: boolean;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  secondsInactiveNotify: number;

  @IsPositive()
  @IsOptional({
    groups: ['patch']
  })
  secondsInactiveMax: number;
}