// test/auth.e2e-spec.ts
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../src/prisma/prisma.service";
import { PrismaFake } from "./prisma.fake";

describe("Auth e2e", () => {
	let app: INestApplication;
	let prismaFake: PrismaFake;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AppModule,
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true,
					load: [
						() => ({
							DATABASE_URL: "postgres://in-memory-fake-not-used",
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

		prismaFake = moduleRef.get<PrismaService>(
			PrismaService,
		) as unknown as PrismaFake;

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

	beforeEach(() => {
		// isolate state per test
		prismaFake.cleanDatabase();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("POST /auth/register", () => {
		const validUser = {
			email: "alice@example.com",
			password: "SecurePass123!",
		};

		it("registers a new user successfully", async () => {
			const res = await request(app.getHttpServer())
				.post("/auth/register")
				.send(validUser)
				.expect(201);

			// Debug if needed
			// console.log('Register response:', JSON.stringify(res.body, null, 2));

			// shape produced by your controller/service (based on your logs)
			expect(res.body).toEqual(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						user_id: expect.any(String), // uuid
						user_email: validUser.email,
						createdAt: expect.any(String), // ISO string
					}),
					message: "User registered successfully!",
				}),
			);
		});

		it("rejects duplicate email registration", async () => {
			await request(app.getHttpServer())
				.post("/auth/register")
				.send(validUser)
				.expect(201);

			const res = await request(app.getHttpServer())
				.post("/auth/register")
				.send(validUser)
				.expect(409);

			// accept either your explicit error or a message containing 'already'
			expect(res.body).toEqual(
				expect.objectContaining({
					message: expect.stringMatching(/already/i),
				}),
			);
		});

		it("validates email format", async () => {
			const res = await request(app.getHttpServer())
				.post("/auth/register")
				.send({ email: "not-an-email", password: "StrongPass123!" })
				.expect(400);

			// matches Nest ValidationPipe default error shape
			expect(res.body).toEqual(
				expect.objectContaining({
					statusCode: 400,
					error: "Bad Request",
					message: expect.arrayContaining([
						expect.stringMatching(/email must be an email/i),
					]),
				}),
			);
		});

		it("validates password requirements", async () => {
			const res = await request(app.getHttpServer())
				.post("/auth/register")
				.send({ email: "ok@example.com", password: "123" }) // intentionally weak
				.expect(400);

			// Allow any validation message array that includes "password" complaint
			expect(res.body).toEqual(
				expect.objectContaining({
					statusCode: 400,
					error: "Bad Request",
					message: expect.arrayContaining([expect.stringMatching(/password/i)]),
				}),
			);
		});

		it("requires both fields", async () => {
			await request(app.getHttpServer())
				.post("/auth/register")
				.send({ email: "only@example.com" })
				.expect(400);
			await request(app.getHttpServer())
				.post("/auth/register")
				.send({ password: "OnlyPass123!" })
				.expect(400);
		});
	});

	describe("POST /auth/login", () => {
		const testUser = {
			email: "bob@example.com",
			password: "SecurePass123!",
		};

		beforeEach(async () => {
			// Arrange: register user
			const registerRes = await request(app.getHttpServer())
				.post("/auth/register")
				.send(testUser)
				.expect(201);
			console.log("Registration for login test:", registerRes.body);
		});

		it("logs in successfully with valid credentials", async () => {
			const res = await request(app.getHttpServer())
				.post("/auth/login")
				.send(testUser)
				.expect(200);

			// console.log("Login response:", JSON.stringify(res.body, null, 2));

			expect(res.body).toEqual(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						access_token: expect.any(String),
					}),
					message: "User signed in successfully",
				}),
			);

			// Basic JWT shape check
			expect(res.body.data.access_token).toMatch(
				/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
			);
		});

		it("returns 401 for wrong password", async () => {
			const res = await request(app.getHttpServer())
				.post("/auth/login")
				.send({ email: testUser.email, password: "WrongPassword1!" })
				.expect(401);

			expect(res.body).toEqual(
				expect.objectContaining({ message: expect.stringMatching(/invalid/i) }),
			);
		});

		it("returns 401 for non-existent user", async () => {
			await prismaFake.users.deleteMany({});
			await request(app.getHttpServer())
				.post("/auth/login")
				.send({ email: "nouser@example.com", password: "SecurePass123!" })
				.expect(401);
		});

		it("validates required fields", async () => {
			await request(app.getHttpServer())
				.post("/auth/login")
				.send({ email: testUser.email })
				.expect(400);
			await request(app.getHttpServer())
				.post("/auth/login")
				.send({ password: testUser.password })
				.expect(400);
			await request(app.getHttpServer())
				.post("/auth/login")
				.send({ email: "not-an-email", password: testUser.password })
				.expect(400);
		});
	});

	describe("Authentication Edge Cases", () => {
		it("handles special characters in email", async () => {
			const specialUser = {
				email: "first.last+tag@sub.example.co.uk",
				password: "StrongPass123!",
			};
			const res = await request(app.getHttpServer())
				.post("/auth/register")
				.send(specialUser)
				.expect(201);

			expect(res.body.data.user_email).toBe(specialUser.email);
		});
	});
});
