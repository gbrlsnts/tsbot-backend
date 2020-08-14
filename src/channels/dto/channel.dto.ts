import { Min, Max } from "class-validator";

export class ChannelDto {
    @Min(2)
    @Max(28)
    name: string;

    @Min(4)
    @Max(100)
    password: string;
}