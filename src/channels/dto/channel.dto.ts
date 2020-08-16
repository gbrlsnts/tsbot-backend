import { Length } from "class-validator";

export class ChannelDto {
    @Length(2, 28)
    name: string;

    @Length(4, 100)
    password: string;
}