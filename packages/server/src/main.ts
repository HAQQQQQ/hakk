import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

config();

async function bootstrap() {
    const port = process.env.PORT ?? 3001;
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

    const useNginx = isEnvTrue(process.env.USE_NGINX);
    // Restricts API to localhost-only by binding to 127.0.0.1
    if (useNginx) {
        await app.listen(port, '127.0.0.1');  // Ensures the API only listens on localhost
    }
    else {
        await app.listen(port);  // Ensures the API only listens on localhost
    }

}

bootstrap();


export const isEnvTrue = (value?: string): boolean => {
    return value?.toLowerCase() === 'true';
};