import { Controller, Delete, Get, InternalServerErrorException, Param } from "@nestjs/common";
import { InterestsService } from "./interests.service";

export interface InterestResponseDto {
	id: number;
	name: string;
}

@Controller("interests")
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Get()
	async getAllInterests(): Promise<any[]> {
		//InterestResponseDto[]> {
		return await this.interestsService.getAllInterests();
	}

	@Get(":id")
	async getInterestById(@Param("id") id: string): Promise<any> {
		// InterestResponseDto | { message: string }> {
		const interest = await this.interestsService.getInterestById(Number(id));
		if (!interest) {
			return { message: `❌ Interest with ID ${id} not found.` };
		}
		return interest;
	}

	@Delete("/clear-cache")
	async deleteFromCache(): Promise<string> {
		console.log("In here");
		return this.interestsService.deleteFromCache();
	}

	// ❌ Simulated "Internal Server Error"
	@Get("/server-error")
	triggerServerError(): void {
		throw new InternalServerErrorException("Simulated internal error for testing.");
	}
}
