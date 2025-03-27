import { Controller, Get } from "@nestjs/common";
import { InterestsService } from "./interests.service";
import axios from "axios";

export interface InterestResponseDto {
	id: number;
	name: string;
}

@Controller("interests")
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Get()
	async getAllInterests(): Promise<any[]> {
		console.log("GET /api/interests route was hit"); // Log to confirm the route is being hit

		await this.callPythonServer();

		return [
			{ id: 1, name: "Fitness" },
			{ id: 2, name: "Music" },
			{ id: 3, name: "Gaming" },
		];
	}

	private async callPythonServer(): Promise<any> {
		console.log("Before call to Python server");

		try {
			const res = await axios.get("http://localhost:5000/"); // Or POST, etc.
			console.log("Response:", res.data);
			return res.data;
		} catch (err) {
			console.error("Error calling Python server:", err.message);
			return null;
		}
	}
}
