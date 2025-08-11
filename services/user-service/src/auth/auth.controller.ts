import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { userPayload } from "./interfaces/user-response.interface";
import { userRegisterPayload } from "./interfaces/register-payload.interface";
import { userLoginPayload } from "./interfaces/login-payload.interface";
import { Throttle } from "@nestjs/throttler";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Register a new user",
		description: "Create a new user account with email and password",
	})
	@ApiResponse({
		status: 201,
		description: "User registered successfully",
		schema: {
			example: {
				success: true,
				data: {
					user_id: "uuid-here",
					user_email: "user@example.com",
					createdAt: "2025-01-01 00:00:00.000",
				},
				message: "User registered successfully!",
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: "Bad request - validation failed or user already exists",
	})
	@ApiResponse({
		status: 409,
		description: "Conflict - email already registered",
	})
	async register(
		@Body() dto: RegisterDto,
	): Promise<userPayload<userRegisterPayload>> {
		const res = await this.auth.register(dto.email, dto.password);
		return {
			success: true,
			data: res,
			message: "User registered successfully!",
		};
	}

	@Throttle({ default: { ttl: 60_000, limit: 5 } })
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Login user",
		description: "Authenticate user and return JWT token",
	})
	@ApiResponse({
		status: 200,
		description: "User logged in successfully",
		schema: {
			example: {
				success: true,
				data: {
					access_token: "ssfsfgfgGgghgciOfgfgIFfgfgUzI1NiIsInR5cCI6IkpXVCJ9...",
				},
				message: "User signed in successfully",
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized - invalid credentials",
	})
	@ApiResponse({
		status: 400,
		description: "Bad request - validation failed",
	})
	async login(@Body() dto: LoginDto): Promise<userPayload<userLoginPayload>> {
		const res = await this.auth.login(dto.email, dto.password);
		return {
			success: true,
			data: res,
			message: "User signed in successfully",
		};
	}
}
