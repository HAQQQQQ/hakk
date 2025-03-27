import { Controller, Get } from "@nestjs/common";
import { InterestsService } from "./interests.service";

@Controller("interests")
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Get()
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
}
