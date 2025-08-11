import { Module } from "@nestjs/common";
import * as Joi from "joi";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { TodosModule } from "./todos/todos.module";
import { JwtModule } from "@backendrestapi/jwt";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
			validationSchema: Joi.object({
				DATABASE_URL: Joi.string().uri().required(),
				JWT_SECRET: Joi.string().min(16).required(),
				JWT_EXPIRES_IN: Joi.string().default("900s"),
				PORT: Joi.number().default(3002),
			}),
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60_000,
				limit: 60,
			},
		]),
		PrismaModule,
		JwtModule.register(),
		TodosModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
