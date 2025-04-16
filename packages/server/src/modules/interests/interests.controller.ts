import { Body, Controller, Get, Post } from "@nestjs/common";
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

	@Post("test")
	async testPost(@Body() body: string): Promise<any> {
		console.log("POST /api/test route was hit"); // Log to confirm the route is being hit

		console.log("_body:", body);

		return [
			{ id: 1, name: "Dancing" },
			{ id: 2, name: "Lifting" },
			{ id: 3, name: "Running" },
		];
	}
}
