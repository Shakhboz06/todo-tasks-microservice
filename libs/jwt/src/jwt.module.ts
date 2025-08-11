import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule as JwtAuthModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

@Module({})
export class JwtModule {
	static register() {
		return {
			module: JwtModule,
			imports: [
				PassportModule.register({ defaultStrategy: "jwt" }),
				JwtAuthModule.registerAsync({
					inject: [ConfigService],
					useFactory: (config: ConfigService) => ({
						secret: config.getOrThrow<string>("JWT_SECRET"),
						signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") },
					}),
				}),
			],
			providers: [JwtStrategy],
			exports: [PassportModule, JwtAuthModule],
		};
	}
}
