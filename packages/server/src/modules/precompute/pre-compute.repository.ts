import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Concept, ConceptPairResult, Topic } from "./pre-compute.types";

@Injectable()
export class PrecomputeRepository {
	private readonly TOPIC_TABLE: string = "topic";
	private readonly CONCEPT_TABLE: string = "concept";
	private readonly CONCEPT_SIMILARITY_TABLE: string = "concept_similarity";

	constructor(private readonly supabaseService: SupabaseService) {}

	/**
	 * Fetches all concepts for a topic by topic name
	 * @param topicName The name of the topic to search for
	 * @returns Promise containing the topic with its concepts or null if not found
	 */
	async getTopicWithConcepts(topicName: string): Promise<Topic | null> {
		// First, get the topic id from the name
		const { data: topicData, error: topicError } = await this.supabaseService.client
			.from(`${this.TOPIC_TABLE}`)
			.select("id, name")
			.eq("name", topicName)
			.single();

		if (topicError || !topicData) {
			console.error("Error fetching topic:", topicError);
			return null;
		}

		// Then, get all concepts related to this topic using the topic_id foreign key
		const { data: conceptsData, error: conceptsError } = await this.supabaseService.client
			.from(`${this.CONCEPT_TABLE}`)
			.select("id, name, description")
			.eq("topic_id", topicData.id);

		if (conceptsError) {
			console.error("Error fetching concepts:", conceptsError);
			return null;
		}

		// Construct the Topic object with its concepts
		return {
			name: topicData.name,
			concepts: conceptsData as Concept[],
		};
	}

	async storeConceptSimilarities(results: ConceptPairResult[]): Promise<void> {
		const rowsToInsert = results.map((item) => {
			const conceptMinId = Math.min(item.conceptA_id, item.conceptB_id);
			const conceptMaxId = Math.max(item.conceptA_id, item.conceptB_id);

			return {
				concept_a_id: conceptMinId,
				concept_b_id: conceptMaxId,
				similarity_score: item.similarity,
			};
		});

		const { data, error } = await this.supabaseService.client
			.from(`${this.CONCEPT_SIMILARITY_TABLE}`)
			.upsert(rowsToInsert, {
				onConflict: "concept_a_id,concept_b_id",
			});

		if (error) {
			console.error("❌ Failed to insert into Supabase:", error);
		} else {
			console.log("✅ Inserted concept similarities into Supabase:", data);
		}
	}
}
