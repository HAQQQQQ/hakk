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
	async getAllInterests(): Promise<any> {
		console.log("GET /api/interests route was hit"); // Log to confirm the route is being hit

		const response = await this.callPythonServer();
		return response;

		// return [
		//     { id: 1, name: "Fitness" },
		//     { id: 2, name: "Music" },
		//     { id: 3, name: "Gaming" },
		// ];
	}

	private callPythonServer(): Promise<any> {
		return this._callPythonServer("josh", "sarah");
	}

	private async _callPythonServer(userA: string, userB: string): Promise<any> {
		console.log("Calling Python server with:", { userA, userB });

		try {
			const res = await axios.get("http://localhost:5000/match", {
				params: {
					userA,
					userB,
				},
			});
			console.log("Response from Python:", res.data);
			return res.data;
		} catch (err: any) {
			console.error("Error calling Python server:", err.message);
			return null;
		}
	}
}
