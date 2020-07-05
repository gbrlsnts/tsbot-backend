import * as config from "config";
import { PassportStrategy } from "@nestjs/passport";
import { UnauthorizedException, Injectable } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { JwtPayload } from "./auth.types";

const secret = process.env.JWT_SECRET || config.get('jwt.secret');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User>
    {
        const { email } = payload;

        const user = await this.usersService.getUserByEmail(email);

        if(!user)
            throw new UnauthorizedException();

        return user;
    }
}