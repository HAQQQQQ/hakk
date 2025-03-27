import { Controller, Get } from "@nestjs/common";
import { InterestsService } from "./interests.service";
import axios from "axios";
import { z } from "zod";

export interface InterestResponseDto {
	id: number;
	name: string;
}

// export type MatchInput = {
//     userA: string;
//     userB: string;
// };

export const MatchSchema = z.object({
	userA: z.string(),
	userB: z.string(),
});

export type MatchInput = z.infer<typeof MatchSchema>;

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
		return this._callPythonServer({ userA: "josh", userB: "sarah" });
	}

	private async _callPythonServer(input: MatchInput): Promise<any> {
		console.log("Calling Python server with:", input);

		try {
			const res = await axios.post("http://localhost:5000/match", input);
			console.log("✅ Match score:", res.data);
			return res.data;
		} catch (error: any) {
			console.error("❌ Python API error:", error.response?.data || error.message);
		}
	}
}
