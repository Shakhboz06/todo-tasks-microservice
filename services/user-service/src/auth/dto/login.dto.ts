import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
	@ApiProperty({
		example: "any@example.com",
		description: "Previusly registered email",
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		example: "password123",
		description: "User password(minimum 6 characters mandatory)",
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password!: string;
}
