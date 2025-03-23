import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppConfig } from './config/app.config';

// config();

async function bootstrap() {
    const port = AppConfig.port;
    console.log(`---Server running on port: ${port}---`);
    const app = await NestFactory.create(AppModule);

    // Set global prefix for all routes
    app.setGlobalPrefix('api');

    // Apply global interceptors and filters
    const configureGlobalMiddleware = () => {
        app.useGlobalInterceptors(new ResponseInterceptor());
        app.useGlobalFilters(new HttpExceptionFilter());
    };

    configureGlobalMiddleware();

    if (AppConfig.useNginx) {
        await app.listen(AppConfig.port, '127.0.0.1');
    } else {
        await app.listen(AppConfig.port);
    }

}

bootstrap();
