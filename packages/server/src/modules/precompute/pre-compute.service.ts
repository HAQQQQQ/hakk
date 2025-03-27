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
import { PreComputeConfig } from "./pre-compute.config";
import { PreComputeApiService } from "./pre-compute.api";

@Injectable()
export class PreComputeService implements OnModuleInit {
	constructor(
		private readonly preComputeApiService: PreComputeApiService,
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
			const conceptPairsResponse =
				await this.preComputeApiService.callMatchingService(conceptPairs);
			if (conceptPairsResponse) {
				await this.preComputeRepository.storeConceptSimilarities(conceptPairsResponse);
			}
		}
	}

	private async fetchGraphTokens(): Promise<Topic[]> {
		const allTopics: Topic[] = [];
		const batchSize = PreComputeConfig.BATCH_SIZE;
		// Process in batches to avoid overwhelming the database
		for (let i = 0; i < this.graphTokens.length; i += batchSize) {
			const batch = this.graphTokens.slice(i, i + batchSize);

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

	private generateUniqueConceptPairs(concepts: Concept[]): ConceptPair[] {
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
