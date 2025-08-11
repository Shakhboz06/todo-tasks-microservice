import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Request,
	UseGuards,
} from "@nestjs/common";
import { TodosService } from "./todos.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dt";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { TodoResponse } from "./interfaces/todo.interface";
import { ResponsePayload } from "./interfaces/api-response.interface";
import { TodoListResponse } from "./interfaces/todo-list.interface";

@ApiTags("todo tasks")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("todos")
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a new todo task" })
	@ApiResponse({
		status: 201,
		description: "Todo task created successfully",
		schema: {
			example: {
				taskId: "todo id-here",
				content: "Buy milk",
				userId: "user-uuid",
				createdAt: "2025-01-01 00:00:00.000",
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - validation failed" })
	@ApiResponse({ status: 401, description: "Unauthorized - invalid token" })
	async create(
		@Request() req: any,
		@Body() dto: CreateTodoDto,
	): Promise<ResponsePayload<TodoResponse>> {
		const res = await this.todosService.create(req.user.userId, dto);
		return {
			success: true,
			data: res,
			message: "Todo task created successfully",
		};
	}

	@Get()
	@ApiOperation({
		summary: "Retrive all todo tasks for the authenticated user",
	})
	@ApiResponse({
		status: 200,
		description: "Todo tasks retrieved successfully",
		schema: {
			example: [
				{
					taskId: "task-id-here",
					content: "Buy milk",
					userId: "user-uuid",
					createdAt: "2025-01-01 00:00:00.000",
					updatedAt: "2025-01-01 00:00:00.000",
				},
			],
		},
	})
	@ApiResponse({ status: 401, description: "Unauthorized - invalid token" })
	async findAll(
		@Request() req: any,
	): Promise<ResponsePayload<TodoListResponse>> {
		const res = await this.todosService.findAll(req.user.userId);

		return {
			success: true,
			data: res,
			message: "Todo tasks retrieved successfully",
		};
	}

	@Put(":taskId")
	@ApiOperation({ summary: "Update a todo task by taskId" })
	@ApiParam({ name: "taskId", description: "Todo task taskId" })
	@ApiResponse({
		status: 200,
		description: "Todo task updated successfully",
		schema: {
			example: {
				id: "task-id-here",
				content: "Buy milk and bread",
				userId: "user-uuid",
				createdAt: "2025-01-01 00:00:00.000",
				updatedAt: "2025-01-01 00:00:00.000",
			},
		},
	})
	@ApiResponse({ status: 400, description: "Bad request - validation failed" })
	@ApiResponse({ status: 401, description: "Unauthorized - invalid token" })
	@ApiResponse({ status: 404, description: "Todo task not found" })
	async update(
		@Request() req: any,
		@Param("taskId") taskId: string,
		@Body() dto: UpdateTodoDto,
	): Promise<ResponsePayload<TodoResponse>> {
		const res = await this.todosService.update(req.user.userId, taskId, dto);
		return {
			success: true,
			data: res,
			message: "Todo task updated successfully",
		};
	}

	@Delete(":taskId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a todo task by taskId" })
	@ApiParam({ name: "taskId", description: "Todo task of taskId" })
	@ApiResponse({ status: 204, description: "Todo task deleted successfully" })
	@ApiResponse({ status: 401, description: "Unauthorized - invalid token" })
	@ApiResponse({ status: 404, description: "Todo task not found" })
	async delete(
		@Request() req: any,
		@Param("taskId") taskId: string,
	): Promise<void> {
		await this.todosService.delete(req.user.userId, taskId);
	}
}
