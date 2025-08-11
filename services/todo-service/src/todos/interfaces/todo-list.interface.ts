import { TodoResponse } from "./todo.interface";

export interface TodoListResponse {
	tasks: TodoResponse[];
	length: number;
}
