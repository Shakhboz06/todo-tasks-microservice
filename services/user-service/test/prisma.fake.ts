// test/prisma.fake.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { randomUUID } from "crypto";

type UserRow = {
	id: number; // internal autoincrement
	uuid: string; // public id exposed outward as user_id
	userEmail: string; // stored email
	userPwd: string; // hashed password (AuthService will provide this)
	createdAt: Date;
	updatedAt: Date;
};

@Injectable()
export class PrismaFake implements OnModuleInit, OnModuleDestroy {
	private _users: UserRow[] = [];
	private _idSeq = 1;

	// keep PrismaService lifecycle shape but do nothing
	async onModuleInit(): Promise<void> {}
	async onModuleDestroy(): Promise<void> {}

	// helper for tests
	cleanDatabase() {
		this._users = [];
		this._idSeq = 1;
	}

	// Prisma-like users model
	public users = {
		// findUnique({ where: { userEmail } }) OR findUnique({ where: { uuid } })
		findUnique: async (args: {
			where: { userEmail?: string; uuid?: string };
		}): Promise<UserRow | null> => {
			const where = args?.where ?? {};
			if (typeof where.userEmail === "string") {
				return this._users.find((u) => u.userEmail === where.userEmail) ?? null;
			}
			if (typeof where.uuid === "string") {
				return this._users.find((u) => u.uuid === where.uuid) ?? null;
			}
			return null;
		},

		// create({ data: { userEmail, userPwd } })
		create: async (args: {
			data: { userEmail: string; userPwd: string };
		}): Promise<UserRow> => {
			const now = new Date();
			const row: UserRow = {
				id: this._idSeq++,
				uuid: randomUUID(),
				userEmail: args.data.userEmail,
				userPwd: args.data.userPwd,
				createdAt: now,
				updatedAt: now,
			};
			this._users.push(row);
			return { ...row };
		},

		// findMany()
		findMany: async (_args?: unknown): Promise<UserRow[]> => {
			return [...this._users];
		},

		// deleteMany({ where: {} })
		deleteMany: async (_args?: unknown): Promise<{ count: number }> => {
			const count = this._users.length;
			this._users = [];
			return { count };
		},
	};

	// optional debug helper
	__debug_listUsers() {
		return [...this._users];
	}
}
