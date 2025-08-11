import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateTodoDto {
	@ApiProperty({
		example: "Buy groceries and cook dinner",
		description: "the new content to update todo value",
	})
	@IsOptional()
	@IsString()
	@MinLength(2)
	@IsNotEmpty()
	content!: string;
}
