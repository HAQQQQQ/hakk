import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from "./config/app.config";

async function bootstrap() {
    const port = AppConfig.port;
    console.log(`---Redis-server running on port: ${port}---`);
    const app = await NestFactory.create(AppModule);
    await app.listen(port);
}
bootstrap();
