import { Injectable } from "@nestjs/common";
import axios from "axios";
import { EnvConfig } from "@/config/env.config";
import { ConceptPair, ConceptPairResult } from "./pre-compute.types";

@Injectable()
export class PreComputeApiService {
	private readonly headers = { "Content-Type": "application/json" };
	private readonly matchingServiceUrl = `http://localhost:${EnvConfig.matcherPort}/similarity`;

	async callMatchingService(conceptPairs: ConceptPair[]): Promise<ConceptPairResult[]> {
		console.log("📡 Calling Python server with:", conceptPairs);

		try {
			const res = await axios.post<ConceptPairResult[]>(
				this.matchingServiceUrl,
				conceptPairs,
				{ headers: this.headers },
			);

			console.log("✅ Match scores:", res.data);
			return res.data;
		} catch (error: any) {
			console.error("❌ Python API error:", error.response?.data || error.message);
			throw new Error("Failed to fetch match scores from Python server.");
		}
	}
}
