import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dt";
import { TodoResponse } from "./interfaces/todo.interface";
import { TodoListResponse } from "./interfaces/todo-list.interface";

@Injectable()
export class TodosService {
	constructor(private prisma: PrismaService) {}

	private mapTodoResponse(task: any): TodoResponse {
		return {
			taskId: task.uuid,
			content: task.content,
			userId: task.user_uuid,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		};
	}

	async create(userUuid: string, dto: CreateTodoDto): Promise<TodoResponse> {
		const task = await this.prisma.tasks.create({
			data: {
				content: dto.content,
				user_uuid: userUuid,
			},
		});

		return this.mapTodoResponse(task);
	}

	async findAll(userUuid: string): Promise<TodoListResponse> {
		const todos = await this.prisma.tasks.findMany({
			where: { user_uuid: userUuid },
		});

		return {
			tasks: todos.map((task) => this.mapTodoResponse(task)),
			length: todos.length,
		};
	}

	async update(
		userUuid: string,
		todoUuid: string,
		dto: UpdateTodoDto,
	): Promise<TodoResponse> {
		const tasks = await this.prisma.tasks.findUnique({
			where: { uuid: todoUuid },
		});
		if (!tasks) throw new NotFoundException("Your todo task not found");
		if (tasks.user_uuid !== userUuid) throw new ForbiddenException();

		const updatedTask = await this.prisma.tasks.update({
			where: { uuid: todoUuid },
			data: { ...dto },
		});

		return this.mapTodoResponse(updatedTask);
	}

	async delete(userUuid: string, todoUuid: string) {
		const tasks = await this.prisma.tasks.findUnique({
			where: { uuid: todoUuid },
		});
		if (!tasks) throw new NotFoundException("Your todo task not found");
		if (tasks.user_uuid !== userUuid) throw new ForbiddenException();

		await this.prisma.tasks.delete({
			where: { uuid: todoUuid },
		});

		return { message: "Todo task deleted successfully" };
	}
}
