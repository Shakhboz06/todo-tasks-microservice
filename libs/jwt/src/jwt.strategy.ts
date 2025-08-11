import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

interface JwtPayload {
	sub: string;
	email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
		});
	}

	validate(payload: JwtPayload) {
		if (!payload.sub || !payload.email) {
			throw new UnauthorizedException("Invalid token payload");
		}
		// payload.sub is user.id, payload.email is user.email
		return { userId: payload.sub, email: payload.email };
	}
}
