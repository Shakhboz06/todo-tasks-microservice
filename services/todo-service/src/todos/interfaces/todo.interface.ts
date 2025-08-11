export interface TodoResponse {
	taskId: string;
	content: string;
	userId: string;
	createdAt: Date;
	updatedAt?: Date;
}
