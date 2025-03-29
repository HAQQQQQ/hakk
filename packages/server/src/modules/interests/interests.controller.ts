import { Controller, Get, Param } from "@nestjs/common";
import { InterestsService } from "./interests.service";

@Controller("interests")
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Get("/all")
	async getAllInterests(): Promise<any> {
		console.log("GET /api/interests route was hit"); // Log to confirm the route is being hit

		// const response = await this.callPythonServer();
		// return response;

		return [
			{ id: 1, name: "Fitness" },
			{ id: 2, name: "Music" },
			{ id: 3, name: "Gaming" },
		];
	}

	@Get("user/:userId")
	async getInterestsByUser(@Param("userId") userId: string): Promise<any> {
		const data = await this.interestsService.getInterestsForUser(userId);
		return { message: "Interest fetched successfully", data: data };
	}
}
