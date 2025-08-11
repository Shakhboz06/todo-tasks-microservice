// import { Test } from '@nestjs/testing';
// import { TodosService } from './todos.service';
// import { PrismaService } from '../prisma/prisma.service';

// describe('TodosService', () => {
//   let service: TodosService;

//   // Create individual mock functions with proper Jest typing
//   const mockTasksCreate = jest.fn();
//   const mockTasksFindMany = jest.fn();
//   const mockTasksFindUnique = jest.fn();
//   const mockTasksUpdate = jest.fn();
//   const mockTasksDelete = jest.fn();

//   beforeEach(async () => {
//     // Reset all mocks before each test
//     jest.clearAllMocks();

//     const module = await Test.createTestingModule({
//       providers: [
//         TodosService,
//         {
//           provide: PrismaService,
//           useValue: {
//             tasks: {
//               create: mockTasksCreate,
//               findMany: mockTasksFindMany,
//               findUnique: mockTasksFindUnique,
//               update: mockTasksUpdate,
//               delete: mockTasksDelete,
//             },
//           },
//         },
//       ],
//     }).compile();

//     service = module.get(TodosService);
//   });

//   // CREATE tests
//   it('should create task and persist with user_uuid', async () => {
//     const mockTask = {
//       id: 1,
//       uuid: 't-1',
//       content: 'Test task',
//       user_uuid: 'u-123',
//       createdAt: new Date('2023-01-01'),
//       updatedAt: new Date('2023-01-01'),
//     };

//     mockTasksCreate.mockResolvedValue(mockTask);

//     const result = await service.create('u-123', { content: 'Test task' });

//     expect(mockTasksCreate).toHaveBeenCalledWith({
//       data: { content: 'Test task', user_uuid: 'u-123' },
//     });
//     expect(result).toMatchObject({ content: 'Test task' });
//     expect(mockTasksCreate).toHaveBeenCalledTimes(1);
//   });

//   // FIND ALL tests
//   it('should return tasks filtered by user', async () => {
//     mockTasksFindMany.mockResolvedValue([
//       { uuid: 't-1', user_uuid: 'u-123' }
//     ]);

//     const result = await service.findAll('u-123');

//     expect(mockTasksFindMany).toHaveBeenCalledWith({
//       where: { user_uuid: 'u-123' }
//     });
//     expect(result).toHaveLength(1);
//   });

//   // UPDATE tests
//   it('should throw error when updating non-existent task', async () => {
//     mockTasksFindUnique.mockResolvedValue(null);

//     await expect(service.update('u-123', 't-1', { content: 'x' }))
//       .rejects.toThrow('Your todo task not found');
//   });

//   it('should throw error when updating task not owned by user', async () => {
//     mockTasksFindUnique.mockResolvedValue({
//       uuid: 't-1',
//       user_uuid: 'other-user'
//     });

//     await expect(service.update('u-123', 't-1', { content: 'x' }))
//       .rejects.toThrow();
//   });

//   it('should update task when user is owner', async () => {
//     mockTasksFindUnique.mockResolvedValue({
//       uuid: 't-1',
//       user_uuid: 'u-123'
//     });
//     mockTasksUpdate.mockResolvedValue({
//       uuid: 't-1',
//       content: 'x',
//       user_uuid: 'u-123'
//     });

//     const result = await service.update('u-123', 't-1', { content: 'x' });

//     expect(mockTasksUpdate).toHaveBeenCalledWith({
//       where: { uuid: 't-1' },
//       data: { content: 'x' },
//     });
//     expect(result).toMatchObject({ content: 'x' });
//   });

//   // DELETE tests
//   it('should throw error when deleting non-existent task', async () => {
//     mockTasksFindUnique.mockResolvedValue(null);

//     await expect(service.delete('u-123', 't-1'))
//       .rejects.toThrow('Your todo task not found');
//   });

//   it('should throw error when deleting task not owned by user', async () => {
//     mockTasksFindUnique.mockResolvedValue({
//       uuid: 't-1',
//       user_uuid: 'other-user'
//     });

//     await expect(service.delete('u-123', 't-1'))
//       .rejects.toThrow();
//   });

//   it('should delete task when user is owner', async () => {
//     mockTasksFindUnique.mockResolvedValue({
//       uuid: 't-1',
//       user_uuid: 'u-123'
//     });
//     mockTasksDelete.mockResolvedValue({ uuid: 't-1' });

//     const result = await service.delete('u-123', 't-1');

//     expect(mockTasksDelete).toHaveBeenCalledWith({
//       where: { uuid: 't-1' }
//     });
//     expect(result).toMatchObject({
//       message: "Todo task deleted successfully"
//     });
//   });
// });

// src/todos/todos.service.spec.ts
import { Test } from "@nestjs/testing";
import { TodosService } from "./todos.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

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
	it("creates a task and persists user_uuid (mapped to userId)", async () => {
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

		// Service maps: uuid -> taskId, user_uuid -> userId
		expect(result).toMatchObject({
			taskId: "t-1",
			content: "Test task",
			userId: "u-123",
		});
		expect(mockTasksCreate).toHaveBeenCalledTimes(1);
	});

	// ========== FIND ALL ==========
	it("returns tasks filtered by user, mapped to { taskId, userId, ... }", async () => {
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
		expect(result).toHaveLength(1);

		// result is an array; not { tasks: [...] }
		expect(result.tasks[0]).toMatchObject({
			taskId: "t-1",
			userId: "u-123",
			content: "A task",
		});
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

	it("updates task when user is owner (allows for mapped output)", async () => {
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

		// Some services only return content; others map fully. Accept either:
		expect(result).toMatchObject({ content: "x" });
		// If your service maps like findAll/create, this will also pass:
		// expect(result).toMatchObject({ taskId: 't-1', userId: 'u-123', content: 'x' });
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
		expect(result).toMatchObject({ message: "Todo task deleted successfully" });
	});
});
