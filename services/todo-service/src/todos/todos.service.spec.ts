import { Test } from "@nestjs/testing";
import { TodosService } from "./todos.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

// ---- helpers so tests work with any service return shape ----
const unwrap = <T = any>(x: any): T =>
	x && typeof x === "object" && "data" in x ? x.data : x;
const getTaskId = (obj: any) => obj?.uuid ?? obj?.taskId;
const getUserId = (obj: any) => obj?.user_uuid ?? obj?.userId;

describe("TodosService", () => {
	let service: TodosService;

	// Prisma tasks model mocks
	const mockTasksCreate = jest.fn();
	const mockTasksFindMany = jest.fn();
	const mockTasksFindUnique = jest.fn();
	const mockTasksUpdate = jest.fn();
	const mockTasksDelete = jest.fn();

	const prismaMock = {
		tasks: {
			create: mockTasksCreate,
			findMany: mockTasksFindMany,
			findUnique: mockTasksFindUnique,
			update: mockTasksUpdate,
			delete: mockTasksDelete,
		},
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				TodosService,
				{
					provide: PrismaService,
					useValue: prismaMock,
				},
			],
		}).compile();

		service = module.get(TodosService);
	});

	// ========== CREATE ==========
	it("creates a task and persists user_uuid", async () => {
		const row = {
			id: 1,
			uuid: "t-1",
			content: "Test task",
			user_uuid: "u-123",
			createdAt: new Date("2023-01-01"),
			updatedAt: new Date("2023-01-01"),
		};
		mockTasksCreate.mockResolvedValue(row);

		const result = await service.create("u-123", { content: "Test task" });

		expect(mockTasksCreate).toHaveBeenCalledWith({
			data: { content: "Test task", user_uuid: "u-123" },
		});

		const body = unwrap(result);
		expect(body).toBeTruthy();
		expect(body.content).toBe("Test task");
		expect(getTaskId(body)).toBe("t-1"); // accepts uuid or taskId
		expect(getUserId(body)).toBe("u-123"); // accepts user_uuid or userId
	});

	// ========== FIND ALL ==========
	it("returns tasks filtered by user", async () => {
		const row = {
			id: 1,
			uuid: "t-1",
			content: "A task",
			user_uuid: "u-123",
			createdAt: new Date("2023-01-01"),
			updatedAt: new Date("2023-01-01"),
		};
		mockTasksFindMany.mockResolvedValue([row]);

		const result = await service.findAll("u-123");

		expect(mockTasksFindMany).toHaveBeenCalledWith({
			where: { user_uuid: "u-123" },
		});

		const body = unwrap(result);

		// service might return an array, or { length, tasks }
		const list = Array.isArray(body) ? body : body?.tasks;
		expect(Array.isArray(list)).toBe(true);
		expect(list!.length).toBe(1);
		expect(list![0]).toEqual(
			expect.objectContaining({
				content: "A task",
			}),
		);
		// check IDs via tolerant accessors
		expect(getTaskId(list![0])).toBe("t-1");
		expect(getUserId(list![0])).toBe("u-123");
	});

	// ========== UPDATE ==========
	it("throws NotFoundException when updating non-existent task", async () => {
		mockTasksFindUnique.mockResolvedValue(null);

		await expect(
			service.update("u-123", "t-1", { content: "x" }),
		).rejects.toBeInstanceOf(NotFoundException);
	});

	it("throws ForbiddenException when updating task not owned by user", async () => {
		mockTasksFindUnique.mockResolvedValue({
			uuid: "t-1",
			user_uuid: "other-user",
		});

		await expect(
			service.update("u-123", "t-1", { content: "x" }),
		).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("updates task when user is owner", async () => {
		mockTasksFindUnique.mockResolvedValue({
			uuid: "t-1",
			user_uuid: "u-123",
		});
		mockTasksUpdate.mockResolvedValue({
			id: 1,
			uuid: "t-1",
			content: "x",
			user_uuid: "u-123",
			createdAt: new Date("2023-01-01"),
			updatedAt: new Date("2023-01-02"),
		});

		const result = await service.update("u-123", "t-1", { content: "x" });

		expect(mockTasksUpdate).toHaveBeenCalledWith({
			where: { uuid: "t-1" },
			data: { content: "x" },
		});

		const body = unwrap(result);
		expect(body).toBeTruthy();
		expect(body.content).toBe("x");
		expect(getTaskId(body)).toBe("t-1");
		expect(getUserId(body)).toBe("u-123");
	});

	// ========== DELETE ==========
	it("throws NotFoundException when deleting non-existent task", async () => {
		mockTasksFindUnique.mockResolvedValue(null);

		await expect(service.delete("u-123", "t-1")).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});

	it("throws ForbiddenException when deleting task not owned by user", async () => {
		mockTasksFindUnique.mockResolvedValue({
			uuid: "t-1",
			user_uuid: "other-user",
		});

		await expect(service.delete("u-123", "t-1")).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	it("deletes task when user is owner", async () => {
		mockTasksFindUnique.mockResolvedValue({
			uuid: "t-1",
			user_uuid: "u-123",
		});
		mockTasksDelete.mockResolvedValue({ uuid: "t-1" });

		const result = await service.delete("u-123", "t-1");

		expect(mockTasksDelete).toHaveBeenCalledWith({
			where: { uuid: "t-1" },
		});

		const body = unwrap(result);
		// allow either a simple confirmation or a message wrapper
		if (body && typeof body === "object" && "message" in body) {
			expect(body.message).toMatch(/deleted/i);
		}
	});
});
