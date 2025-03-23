import { Controller, Get } from "@nestjs/common";
import { InterestsService } from "./interests.service";

export interface InterestResponseDto {
	id: number;
	name: string;
}

@Controller("interests")
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Get()
	getAllInterests() {
		console.log("GET /api/interests route was hit"); // Log to confirm the route is being hit

		return [
			{ id: 1, name: "Fitness" },
			{ id: 2, name: "Music" },
			{ id: 3, name: "Gaming" },
		];
	}
}
