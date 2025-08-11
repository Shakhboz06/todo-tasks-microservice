import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNotEmpty } from "class-validator";

export class CreateTodoDto {
	@ApiProperty({ example: "Buy milk", description: "Todo content" })
	@IsString()
	@MinLength(2)
	@IsNotEmpty()
	content!: string;
}
