import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { userRegisterPayload } from "./interfaces/register-payload.interface";
import { userLoginPayload } from "./interfaces/login-payload.interface";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
	) {}

	private mapRegisterResponse(user: any): userRegisterPayload {
		return {
			user_id: user.uuid,
			user_email: user.userEmail,
			createdAt: user.createdAt,
		};
	}

	private mapLoginResponse(token: any): userLoginPayload {
		return {
			access_token: token,
		};
	}

	async register(
		email: string,
		password: string,
	): Promise<userRegisterPayload> {
		const userExist = await this.prisma.users.findUnique({
			where: { userEmail: email },
		});
		if (userExist) {
			throw new ConflictException("Email already in use");
		}

		const hash = await bcrypt.hash(password, 10);

		const user = await this.prisma.users.create({
			data: { userEmail: email, userPwd: hash },
		});

		return this.mapRegisterResponse(user);
	}

	async login(email: string, password: string): Promise<userLoginPayload> {
		const user = await this.prisma.users.findUnique({
			where: { userEmail: email },
		});
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const match = await bcrypt.compare(password, user.userPwd);
		if (!match) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const token = this.jwt.sign({ sub: user.uuid, email: user.userEmail });

		return this.mapLoginResponse(token);
	}
}
