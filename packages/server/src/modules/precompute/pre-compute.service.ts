import { EnvConfig } from "@/config/env.config";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PrecomputeRepository } from "./pre-compute.repository";
import {
	Concept,
	ConceptPair,
	GraphToken,
	PrecomputedGraphTokens,
	Topic,
} from "./pre-compute.types";
import axios from "axios";

@Injectable()
export class PreComputeService implements OnModuleInit {
	private batchSize: number = 5;
	constructor(
		private readonly preComputeRepository: PrecomputeRepository,
		@Inject(PrecomputedGraphTokens.GRAPH_CONFIGS)
		private readonly graphTokens: GraphToken[],
	) {}

	async onModuleInit(): Promise<void> {
		if (!EnvConfig.preCompute) {
			console.log("[PreComputeService] Pre-computation disabled by configuration.");
			return;
		}

		await this.processGraphTokens();
	}

	async processGraphTokens(): Promise<void> {
		const topics: Topic[] = await this.fetchGraphTokens();
		for (const topic of topics) {
			const conceptPairs: ConceptPair[] = this.generateUniqueConceptPairs(topic.concepts);
			const conceptPairsResponse: any[] = await this.callPythonServer(conceptPairs);
			await this.preComputeRepository.storeConceptSimilarities(conceptPairsResponse);
		}
	}

	async callPythonServer(conceptPairs: ConceptPair[]): Promise<any> {
		console.log("📡 Calling Python server with:", conceptPairs);

		try {
			const res = await axios.post("http://localhost:5000/similarity", conceptPairs, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			console.log("✅ Match scores:", res.data);
			return res.data;
		} catch (error: any) {
			console.error("❌ Python API error:", error.response?.data || error.message);
		}
	}

	async fetchGraphTokens(): Promise<Topic[]> {
		const allTopics: Topic[] = [];

		// Process in batches to avoid overwhelming the database
		for (let i = 0; i < this.graphTokens.length; i += this.batchSize) {
			const batch = this.graphTokens.slice(i, i + this.batchSize);

			const batchPromises = batch.map(async (token) => {
				try {
					return await this.preComputeRepository.getTopicWithConcepts(token);
				} catch (error) {
					console.error(`Error fetching topic for token ${token}:`, error);
					return null;
				}
			});

			const batchResults = await Promise.all(batchPromises);
			allTopics.push(...batchResults.filter((topic): topic is Topic => topic !== null));
		}

		return allTopics;
	}

	generateUniqueConceptPairs(concepts: Concept[]): ConceptPair[] {
		const pairs: ConceptPair[] = [];

		for (let i = 0; i < concepts.length; i++) {
			for (let j = i + 1; j < concepts.length; j++) {
				pairs.push({
					conceptA: concepts[i],
					conceptB: concepts[j],
				});
			}
		}

		return pairs;
	}
}
