import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getHello(): string {
        return "Hello World!";
    }

    getHamza(): string {
        return "Im so sad";
    }
}

