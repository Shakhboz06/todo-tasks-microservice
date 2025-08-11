import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
	@ApiProperty({
		example: "test@example.com",
		description: "Unique email address",
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		example: "password123",
		description:
			"original user password will be hashed(minimum 6 characters mandatory)",
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password!: string;
}
