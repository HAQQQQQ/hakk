import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

config();

async function bootstrap() {
	const port = process.env.PORT ?? 3000;
	console.log(`---Redis-server running on port: ${port}---`);
	const app = await NestFactory.create(AppModule);
	await app.listen(port);
}
bootstrap();
