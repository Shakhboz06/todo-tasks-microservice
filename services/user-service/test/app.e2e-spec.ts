import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../src/prisma/prisma.service";
import { PrismaFake } from "./prisma.fake";

describe("App bootstrap (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AppModule,
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true,
					load: [
						() => ({
							DATABASE_USER_URL: "postgres://in-memory-fake-not-used",
							JWT_SECRET: "test-secret-key-for-testing-only-min-32-chars",
							JWT_EXPIRES_IN: "15m",
							PORT: 0,
						}),
					],
				}),
			],
		})
			.overrideProvider(PrismaService)
			.useClass(PrismaFake)
			.compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("server runs and root returns 404 (placeholder)", async () => {
		// Your previous run showed 404 on GET /. Keep test aligned with actual app.
		await request(app.getHttpServer()).get("/").expect(404);
	});
});
