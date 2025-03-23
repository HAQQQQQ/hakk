import { Controller, Delete, Get, InternalServerErrorException, Param } from "@nestjs/common";
import { InterestsService } from "../interests/interests.service";
import { RedisTestService } from "./redis-test.service";

export interface InterestResponseDto {
	id: number;
	name: string;
}

@Controller("redistest")
export class RedisTestController {
	constructor(private readonly redisTestService: RedisTestService) {}

	@Get()
	async getAllInterests(): Promise<any[]> {
		//InterestResponseDto[]> {
		return await this.redisTestService.getAllInterests();
	}

	@Get(":id")
	async getInterestById(@Param("id") id: string): Promise<any> {
		// InterestResponseDto | { message: string }> {
		const interest = await this.redisTestService.getInterestById(Number(id));
		if (!interest) {
			return { message: `❌ Interest with ID ${id} not found.` };
		}
		return interest;
	}

	@Delete("/clear-cache")
	async deleteFromCache(): Promise<string> {
		console.log("In here");
		return this.redisTestService.deleteFromCache();
	}

	// ❌ Simulated "Internal Server Error"
	@Get("/server-error")
	triggerServerError(): void {
		throw new InternalServerErrorException("Simulated internal error for testing.");
	}
}
