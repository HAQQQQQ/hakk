import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Config } from './config/config.js';

async function bootstrap() {
	const port = Config.port;
	console.log(`---Redis-server running on port: ${port}---`);
	const app = await NestFactory.create(AppModule);
	await app.listen(port);
}
bootstrap();
