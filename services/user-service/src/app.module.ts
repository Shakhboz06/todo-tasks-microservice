import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
			validationSchema: Joi.object({
				DATABASE_USER_URL: Joi.string().uri().required(),
				JWT_SECRET: Joi.string().min(16).required(),
				JWT_EXPIRES_IN: Joi.string().default("900s"),
				PORT: Joi.number().default(3001),
			}),
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 50,
			},
		]),
		PrismaModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
