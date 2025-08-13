import * as crypto from "crypto";

type UserRow = {
	id: number;
	uuid: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
};

type TaskRow = {
	id: number;
	uuid: string;
	content: string;
	user_uuid: string; // FK to users.uuid
	createdAt: Date;
	updatedAt: Date;
};

export class PrismaFake {
	private _users: UserRow[] = [];
	private _tasks: TaskRow[] = [];
	private _userIdSeq = 1;
	private _taskIdSeq = 1;

	// ========== USERS ==========
	users = {
		create: async ({ data }: { data: { email: string } }) => {
			const now = new Date();
			const row: UserRow = {
				id: this._userIdSeq++,
				uuid: crypto.randomUUID(),
				email: data.email,
				createdAt: now,
				updatedAt: now,
			};
			this._users.push(row);
			return { ...row };
		},
		findUnique: async ({
			where,
		}: {
			where: { uuid?: string; email?: string };
		}) => {
			if (where.uuid)
				return this._users.find((u) => u.uuid === where.uuid) ?? null;
			if (where.email)
				return this._users.find((u) => u.email === where.email) ?? null;
			return null;
		},
		findMany: async () => [...this._users],
		deleteMany: async () => {
			const count = this._users.length;
			this._users = [];
			return { count };
		},
	};

	// ========== TASKS ==========
	tasks = {
		create: async ({
			data,
		}: {
			data: { content: string; user_uuid: string };
		}) => {
			const user = this._users.find((u) => u.uuid === data.user_uuid);
			if (!user)
				throw new Error(
					`Foreign key violation: user_uuid ${data.user_uuid} not found`,
				);

			const row: TaskRow = {
				id: this._taskIdSeq++,
				uuid: crypto.randomUUID(),
				content: data.content,
				user_uuid: data.user_uuid,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			this._tasks.push(row);
			return { ...row };
		},

		findMany: async ({ where }: { where?: { user_uuid?: string } } = {}) => {
			if (!where?.user_uuid) return [...this._tasks];
			return this._tasks.filter((t) => t.user_uuid === where.user_uuid);
		},

		findUnique: async ({
			where,
		}: {
			where: { uuid?: string; id?: number };
		}) => {
			if (where.uuid)
				return this._tasks.find((t) => t.uuid === where.uuid) ?? null;
			if (where.id) return this._tasks.find((t) => t.id === where.id) ?? null;
			return null;
		},

		update: async ({
			where,
			data,
		}: {
			where: { uuid?: string; id?: number };
			data: Partial<{ content: string }>;
		}) => {
			let idx = -1;
			if (where.uuid) idx = this._tasks.findIndex((t) => t.uuid === where.uuid);
			else if (where.id) idx = this._tasks.findIndex((t) => t.id === where.id);

			if (idx < 0) return null;

			this._tasks[idx] = {
				...this._tasks[idx],
				...data,
				updatedAt: new Date(),
			};
			return { ...this._tasks[idx] };
		},

		delete: async ({ where }: { where: { uuid?: string; id?: number } }) => {
			let idx = -1;
			if (where.uuid) idx = this._tasks.findIndex((t) => t.uuid === where.uuid);
			else if (where.id) idx = this._tasks.findIndex((t) => t.id === where.id);

			if (idx < 0) return null;

			const [deleted] = this._tasks.splice(idx, 1);
			return { ...deleted };
		},

		count: async ({ where }: { where?: { user_uuid?: string } } = {}) => {
			if (!where?.user_uuid) return this._tasks.length;
			return this._tasks.filter((t) => t.user_uuid === where.user_uuid).length;
		},

		deleteMany: async ({ where }: { where?: { user_uuid?: string } } = {}) => {
			if (!where?.user_uuid) {
				const count = this._tasks.length;
				this._tasks = [];
				return { count };
			}
			const before = this._tasks.length;
			this._tasks = this._tasks.filter((t) => t.user_uuid !== where.user_uuid);
			return { count: before - this._tasks.length };
		},
	};

	// ========== UTILITIES ==========
	$reset() {
		this._users = [];
		this._tasks = [];
		this._userIdSeq = 1;
		this._taskIdSeq = 1;
	}

	cleanDatabase() {
		this.$reset();
	}

	$seedUsers(users: Partial<UserRow>[]) {
		this._users = users.map((u, idx) => ({
			id: this._userIdSeq++,
			uuid: u.uuid ?? crypto.randomUUID(),
			email: u.email ?? `user${idx}@test.com`,
			createdAt: u.createdAt ?? new Date(),
			updatedAt: u.updatedAt ?? new Date(),
		}));
	}

	$seedTasks(tasks: Partial<TaskRow>[]) {
		this._tasks = tasks.map((t, idx) => ({
			id: this._taskIdSeq++,
			uuid: t.uuid ?? crypto.randomUUID(),
			content: t.content ?? `Task ${idx}`,
			user_uuid: t.user_uuid ?? "",
			createdAt: t.createdAt ?? new Date(),
			updatedAt: t.updatedAt ?? new Date(),
		}));
	}

	$getAllTasks() {
		return [...this._tasks];
	}

	$getTaskCount() {
		return this._tasks.length;
	}

	$getAllUsers() {
		return [...this._users];
	}
}
