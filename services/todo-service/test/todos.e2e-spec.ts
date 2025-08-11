// import { Test } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import request from 'supertest';
// import { AppModule } from '../src/app.module';
// import { ConfigModule } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../src/prisma/prisma.service';
// import { PrismaFake } from './prisma.fake';

// describe('Todos e2e (todo-service)', () => {
//   let app: INestApplication;
//   let jwt: JwtService;
//   let prismaFake: PrismaFake;
//   const TEST_SECRET = 'test-secret-1234567890';
//   const userUuid = '11111111-1111-1111-1111-111111111111';
//   const otherUuid = '22222222-2222-2222-2222-222222222222';

//   function tokenFor(uuid: string) {
//     return jwt.sign({ sub: uuid, email: 'user@example.com' });
//   }

//   beforeAll(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [
//         AppModule,
//         ConfigModule.forRoot({
//           isGlobal: true,
//           ignoreEnvFile: true,
//           load: [
//             () => ({
//               DATABASE_URL: 'postgres://ignored',
//               JWT_SECRET: TEST_SECRET,
//               JWT_EXPIRES_IN: '900s',
//               PORT: 0,
//             }),
//           ],
//         }),
//       ],
//     })
//       .overrideProvider(PrismaService)
//       .useClass(PrismaFake)
//       .compile();

//     app = moduleRef.createNestApplication();
//     app.useGlobalPipes(
//       new ValidationPipe({
//         whitelist: true,
//         forbidNonWhitelisted: true, // Changed: reject unknown properties for security
//         transform: true
//       })
//     );
//     await app.init();

//     // Get the PrismaFake instance for cleanup
//     prismaFake = moduleRef.get<PrismaService>(PrismaService) as unknown as PrismaFake;

//     // Real JwtService using our test secret — matches the JwtModule in AppModule
//     jwt = new JwtService({ secret: TEST_SECRET });
//   });

//   beforeEach(() => {
//     // Clean database before each test for proper isolation
//     prismaFake.cleanDatabase();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   describe('Authentication', () => {
//     it('POST /todos requires auth -> 401', async () => {
//       await request(app.getHttpServer())
//         .post('/todos')
//         .send({ content: 'x' })
//         .expect(401);
//     });

//     it('GET /todos requires auth -> 401', async () => {
//       await request(app.getHttpServer())
//         .get('/todos')
//         .expect(401);
//     });
//   });

//   describe('CRUD Operations', () => {
//     it('CRUD happy path (owned)', async () => {
//       const token = tokenFor(userUuid);

//       // Create
//       const create = await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: 'buy milk' })
//         .expect(201);

//       const todoUuid = create.body.uuid;
//       expect(create.body).toMatchObject({
//         content: 'buy milk',
//         user_uuid: userUuid,
//         uuid: expect.any(String),
//         id: expect.any(Number),
//         createdAt: expect.any(String),
//         updatedAt: expect.any(String),
//       });

//       // Read (list only mine)
//       const list = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .expect(200);

//       expect(list.body).toEqual(expect.arrayContaining([
//         expect.objectContaining({
//           uuid: todoUuid,
//           user_uuid: userUuid,
//           content: 'buy milk'
//         }),
//       ]));
//       expect(list.body).toHaveLength(1);

//       // Update
//       const update = await request(app.getHttpServer())
//         .put(`/todos/${todoUuid}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: 'buy milk and eggs' })
//         .expect(200);

//       expect(update.body).toMatchObject({
//         content: 'buy milk and eggs',
//         updatedAt: expect.any(String)
//       });

//       // Verify the updated content persists
//       const listAfterUpdate = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .expect(200);

//       expect(listAfterUpdate.body[0]).toMatchObject({
//         content: 'buy milk and eggs'
//       });

//       // Delete
//       await request(app.getHttpServer())
//         .delete(`/todos/${todoUuid}`)
//         .set('Authorization', `Bearer ${token}`)
//         .expect(204);

//       // Verify deletion
//       const listAfterDelete = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .expect(200);

//       expect(listAfterDelete.body).toHaveLength(0);
//     });

//     it('GET /todos only returns user-owned todos', async () => {
//       const tokenUser1 = tokenFor(userUuid);
//       const tokenUser2 = tokenFor(otherUuid);

//       // Create todos for both users
//       await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${tokenUser1}`)
//         .send({ content: 'user1 todo' })
//         .expect(201);

//       await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${tokenUser2}`)
//         .send({ content: 'user2 todo' })
//         .expect(201);

//       // User1 should only see their todo
//       const user1List = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${tokenUser1}`)
//         .expect(200);

//       expect(user1List.body).toHaveLength(1);
//       expect(user1List.body[0]).toMatchObject({
//         content: 'user1 todo',
//         user_uuid: userUuid
//       });

//       // User2 should only see their todo
//       const user2List = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${tokenUser2}`)
//         .expect(200);

//       expect(user2List.body).toHaveLength(1);
//       expect(user2List.body[0]).toMatchObject({
//         content: 'user2 todo',
//         user_uuid: otherUuid
//       });
//     });
//   });

//   describe('Authorization (Ownership)', () => {
//     it('Update/Delete enforce ownership -> 403', async () => {
//       const tokenMine = tokenFor(userUuid);
//       const tokenOther = tokenFor(otherUuid);

//       // create with mine
//       const created = await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${tokenMine}`)
//         .send({ content: 'owned item' })
//         .expect(201);

//       const todoUuid = created.body.uuid;

//       // try update with someone else -> should get 403
//       await request(app.getHttpServer())
//         .put(`/todos/${todoUuid}`)
//         .set('Authorization', `Bearer ${tokenOther}`)
//         .send({ content: 'hijack' })
//         .expect(403);

//       // try delete with someone else -> should get 403
//       await request(app.getHttpServer())
//         .delete(`/todos/${todoUuid}`)
//         .set('Authorization', `Bearer ${tokenOther}`)
//         .expect(403);

//       // Verify original todo is unchanged
//       const list = await request(app.getHttpServer())
//         .get('/todos')
//         .set('Authorization', `Bearer ${tokenMine}`)
//         .expect(200);

//       expect(list.body[0]).toMatchObject({
//         uuid: todoUuid,
//         content: 'owned item' // Should still be original content
//       });
//     });
//   });

//   describe('Error Cases', () => {
//     it('Update/Delete for missing todo -> 404', async () => {
//       const token = tokenFor(userUuid);
//       const missing = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

//       await request(app.getHttpServer())
//         .put(`/todos/${missing}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: 'x' })
//         .expect(404);

//       await request(app.getHttpServer())
//         .delete(`/todos/${missing}`)
//         .set('Authorization', `Bearer ${token}`)
//         .expect(404);
//     });

//     it('Create todo with invalid data -> 400', async () => {
//       const token = tokenFor(userUuid);

//       // Missing content
//       await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .send({})
//         .expect(400);

//       // Empty content
//       await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: '' })
//         .expect(400);

//       // Unknown properties (if forbidNonWhitelisted is true)
//       await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: 'valid', unknownField: 'should be rejected' })
//         .expect(400);
//     });

//     it('Update todo with invalid data -> 400', async () => {
//       const token = tokenFor(userUuid);

//       // First create a valid todo
//       const created = await request(app.getHttpServer())
//         .post('/todos')
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: 'original content' })
//         .expect(201);

//       const todoUuid = created.body.uuid;

//       // Try to update with empty content
//       await request(app.getHttpServer())
//         .put(`/todos/${todoUuid}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({ content: '' })
//         .expect(400);
//     });
//   });
// });

// test/todos.e2e-spec.ts
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import { PrismaFake } from "./prisma.fake";

describe("Todos e2e (todo-service)", () => {
	let app: INestApplication;
	let jwt: JwtService;
	let prismaFake: PrismaFake;

	const TEST_SECRET = "test-secret-1234567890";
	const userUuid = "11111111-1111-1111-1111-111111111111";
	const otherUuid = "22222222-2222-2222-2222-222222222222";

	const tokenFor = (uuid: string) =>
		jwt.sign({ sub: uuid, email: "user@example.com" });

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AppModule,
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true,
					load: [
						() => ({
							DATABASE_URL: "postgres://ignored-in-tests",
							JWT_SECRET: TEST_SECRET,
							JWT_EXPIRES_IN: "900s",
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

		prismaFake = moduleRef.get<PrismaService>(
			PrismaService,
		) as unknown as PrismaFake;
		jwt = new JwtService({ secret: TEST_SECRET });
	});

	beforeEach(async () => {
		// Reset in-memory DB and seed two users so FK on tasks passes
		prismaFake.cleanDatabase?.();
		// If your PrismaFake has $reset, call that instead:
		// prismaFake.$reset?.();

		// Seed users with fixed UUIDs (uses the helper from the adjusted PrismaFake)
		if (typeof (prismaFake as any).$seedUsers === "function") {
			(prismaFake as any).$seedUsers([
				{ uuid: userUuid, email: "user1@example.com" },
				{ uuid: otherUuid, email: "user2@example.com" },
			]);
		} else {
			// Fallback: create and manually overwrite UUIDs if helper not present
			const u1 = await (prismaFake as any).users.create({
				data: { email: "user1@example.com" },
			});
			const u2 = await (prismaFake as any).users.create({
				data: { email: "user2@example.com" },
			});
			// @ts-ignore mutate for tests
			u1.uuid = userUuid;
			// @ts-ignore mutate for tests
			u2.uuid = otherUuid;
		}
	});

	afterAll(async () => {
		await app.close();
	});

	describe("Authentication", () => {
		it("POST /todos requires auth -> 401", async () => {
			await request(app.getHttpServer())
				.post("/todos")
				.send({ content: "x" })
				.expect(401);
		});

		it("GET /todos requires auth -> 401", async () => {
			await request(app.getHttpServer()).get("/todos").expect(401);
		});
	});

	describe("CRUD Operations", () => {
		it("CRUD happy path (owned)", async () => {
			const token = tokenFor(userUuid);

			// Create
			const create = await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "buy milk" })
				.expect(201);

			const todoUuid = create.body.uuid;
			expect(create.body).toMatchObject({
				content: "buy milk",
				user_uuid: userUuid,
				uuid: expect.any(String),
				id: expect.any(Number),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});

			// Read (list only mine)
			const list = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(Array.isArray(list.body)).toBe(true);
			expect(list.body).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						uuid: todoUuid,
						user_uuid: userUuid,
						content: "buy milk",
					}),
				]),
			);
			expect(list.body).toHaveLength(1);

			// Update
			const update = await request(app.getHttpServer())
				.put(`/todos/${todoUuid}`)
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "buy milk and eggs" })
				.expect(200);

			expect(update.body).toMatchObject({
				uuid: todoUuid,
				content: "buy milk and eggs",
				updatedAt: expect.any(String),
			});

			// Verify persists
			const listAfterUpdate = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(listAfterUpdate.body[0]).toMatchObject({
				uuid: todoUuid,
				content: "buy milk and eggs",
			});

			// Delete
			await request(app.getHttpServer())
				.delete(`/todos/${todoUuid}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(204);

			// Verify deletion
			const listAfterDelete = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(listAfterDelete.body).toHaveLength(0);
		});

		it("GET /todos only returns user-owned todos", async () => {
			const tokenUser1 = tokenFor(userUuid);
			const tokenUser2 = tokenFor(otherUuid);

			// Create todos for both users
			await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${tokenUser1}`)
				.send({ content: "user1 todo" })
				.expect(201);

			await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${tokenUser2}`)
				.send({ content: "user2 todo" })
				.expect(201);

			// User1 should only see their todo
			const user1List = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${tokenUser1}`)
				.expect(200);

			expect(user1List.body).toHaveLength(1);
			expect(user1List.body[0]).toMatchObject({
				content: "user1 todo",
				user_uuid: userUuid,
			});

			// User2 should only see their todo
			const user2List = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${tokenUser2}`)
				.expect(200);

			expect(user2List.body).toHaveLength(1);
			expect(user2List.body[0]).toMatchObject({
				content: "user2 todo",
				user_uuid: otherUuid,
			});
		});
	});

	describe("Authorization (Ownership)", () => {
		it("Update/Delete enforce ownership -> 403", async () => {
			const tokenMine = tokenFor(userUuid);
			const tokenOther = tokenFor(otherUuid);

			// create with mine
			const created = await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${tokenMine}`)
				.send({ content: "owned item" })
				.expect(201);

			const todoUuid = created.body.uuid;

			// try update with someone else -> 403
			await request(app.getHttpServer())
				.put(`/todos/${todoUuid}`)
				.set("Authorization", `Bearer ${tokenOther}`)
				.send({ content: "hijack" })
				.expect(403);

			// try delete with someone else -> 403
			await request(app.getHttpServer())
				.delete(`/todos/${todoUuid}`)
				.set("Authorization", `Bearer ${tokenOther}`)
				.expect(403);

			// Verify original todo is unchanged
			const list = await request(app.getHttpServer())
				.get("/todos")
				.set("Authorization", `Bearer ${tokenMine}`)
				.expect(200);

			expect(list.body[0]).toMatchObject({
				uuid: todoUuid,
				content: "owned item",
			});
		});
	});

	describe("Error Cases", () => {
		it("Update/Delete for missing todo -> 404", async () => {
			const token = tokenFor(userUuid);
			const missing = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

			await request(app.getHttpServer())
				.put(`/todos/${missing}`)
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "x" })
				.expect(404);

			await request(app.getHttpServer())
				.delete(`/todos/${missing}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(404);
		});

		it("Create todo with invalid data -> 400", async () => {
			const token = tokenFor(userUuid);

			// Missing content
			await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(400);

			// Empty content (assuming DTO @IsNotEmpty)
			await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "" })
				.expect(400);

			// Unknown properties rejected (forbidNonWhitelisted)
			await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "valid", unknownField: "nope" })
				.expect(400);
		});

		it("Update todo with invalid data -> 400", async () => {
			const token = tokenFor(userUuid);

			// First create a valid todo
			const created = await request(app.getHttpServer())
				.post("/todos")
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "original content" })
				.expect(201);

			const todoUuid = created.body.uuid;

			await request(app.getHttpServer())
				.put(`/todos/${todoUuid}`)
				.set("Authorization", `Bearer ${token}`)
				.send({ content: "" })
				.expect(400);
		});
	});
});
