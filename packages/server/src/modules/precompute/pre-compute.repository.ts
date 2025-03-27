import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Concept, Topic } from "./pre-compute.types";

@Injectable()
export class PrecomputeRepository {
	constructor(private readonly supabaseService: SupabaseService) {}

	/**
	 * Fetches all concepts for a topic by topic name
	 * @param topicName The name of the topic to search for
	 * @returns Promise containing the topic with its concepts or null if not found
	 */
	async getTopicWithConcepts(topicName: string): Promise<Topic | null> {
		// First, get the topic id from the name
		const { data: topicData, error: topicError } = await this.supabaseService.client
			.from("topic")
			.select("id, name")
			.eq("name", topicName)
			.single();

		if (topicError || !topicData) {
			console.error("Error fetching topic:", topicError);
			return null;
		}

		// Then, get all concepts related to this topic using the topic_id foreign key
		const { data: conceptsData, error: conceptsError } = await this.supabaseService.client
			.from("concept")
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

	/**
	 * Fetches a single concept by name
	 * @param conceptName The name of the concept to search for
	 * @returns Promise containing the concept or null if not found
	 */
	// async getConceptByName(conceptName: string): Promise<Concept | null> {
	//     const { data, error } = await this.supabaseService.client
	//         .from('concept')
	//         .select('id, name, description')
	//         .eq('name', conceptName)
	//         .single();

	//     if (error || !data) {
	//         console.error('Error fetching concept:', error);
	//         return null;
	//     }

	//     return data as Concept;
	// }
}
