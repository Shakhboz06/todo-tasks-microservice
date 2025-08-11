import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}
}

@Controller("health")
export class HealthController {
	constructor(private prisma: PrismaService) {}
	@Get()
	async check() {
		const count = await this.prisma.users.count();
		return { status: "ok", users: count };
	}
}
