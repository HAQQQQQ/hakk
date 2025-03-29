import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { AppConfig } from "./config/app.config";
import { EnvConfig } from "./config/env.config";
import { ValidationPipe } from "@nestjs/common";

// Validate critical environment variables before starting the app
AppConfig.validate();

async function bootstrap() {
	const port = EnvConfig.port;
	console.log(`---Server running on port: ${port}---`);
	const app = await NestFactory.create(AppModule);

	// Set global prefix for all routes
	app.setGlobalPrefix("api");
	app.enableCors({
		origin: `http://localhost:${EnvConfig.clientPort}`,
		credentials: true, // if you're using cookies or auth headers
	});

	// Apply global interceptors and filters
	app.useGlobalInterceptors(new ResponseInterceptor());
	app.useGlobalFilters(new HttpExceptionFilter());

	// Apply global validation pipe with transformation options
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Remove properties that are not defined in the DTO
			forbidNonWhitelisted: true, // Throw error if unknown properties are present
			transform: true, // Automatically transform payloads to DTO instances
			transformOptions: { enableImplicitConversion: true },
		}),
	);

	if (EnvConfig.useNginx) {
		await app.listen(port, "0.0.0.0");
	} else {
		console.log("[NGINX] Reverse Proxy disabled by configuration.");
		await app.listen(port);
	}
}

bootstrap();
