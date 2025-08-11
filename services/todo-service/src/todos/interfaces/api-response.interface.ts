export interface ResponsePayload<T> {
	success: boolean;
	data: T;
	message: string;
}
