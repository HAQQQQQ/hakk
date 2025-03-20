// test/test.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class TestService {
	getTestMessage(): string {
		return "Test functionality is working!";
	}
}
