import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "dotenv";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

config();

async function bootstrap() {
    const port = process.env.PORT ?? 3000;
    console.log(`---Server running on port: ${port}---`);
    const app = await NestFactory.create(AppModule);

    const configureGlobalMiddleware = () => {
        app.useGlobalInterceptors(new ResponseInterceptor());
        app.useGlobalFilters(new HttpExceptionFilter());
    };

    configureGlobalMiddleware();

    await app.listen(port);
}


bootstrap();
