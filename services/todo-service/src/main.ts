import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

function buildCorsOptions() {
	const envList =
		process.env.ALLOWED_ORIGINS?.split(",")
			.map((s) => s.trim())
			.filter(Boolean) ?? [];
	const single = process.env.ALLOWED_ORIGINS?.trim();
	const allowlist = new Set<string>([...envList, ...(single ? [single] : [])]);

	return {
		origin: (
			origin: string | undefined,
			callback: (err: Error | null, allowed?: boolean) => void,
		) => {
			// allow non-browser calls / same-origin / tests
			if (!origin) return callback(null, true);
			if (allowlist.has(origin)) return callback(null, true);
			return callback(new Error(`CORS: Origin not allowed: ${origin}`));
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: false, // token in header; no cookies
		preflightContinue: false,
		optionsSuccessStatus: 204,
	} as const;
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(
		helmet({
			crossOriginResourcePolicy: { policy: "cross-origin" },
		}),
	);

	app.enableCors(buildCorsOptions());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // we remove non-whitelisted props,
			forbidNonWhitelisted: true, // throwing any unknown props,
			transform: true, // to automatically transfomr payloads into DTO instances
		}),
	);

	const config = new DocumentBuilder()
		.setTitle("Todo Service API")
		.setDescription("REST API for user tasks, view, post, update, and delete")
		.setVersion("1.0")
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);
	await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
