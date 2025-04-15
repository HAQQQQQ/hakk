import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class TranscriptionsRepository {
	constructor(private readonly supabaseService: SupabaseService) {}

	async create(text: string): Promise<any> {
		try {
			// Based on your table structure, we need to insert the content field
			// The table already has id, created_at (timestamp) which Supabase handles automatically
			const { data, error } = await this.supabaseService.client
				.from("messages")
				.insert({
					content: text,
				})
				.select()
				.single();

			if (error) {
				throw error;
			}

			// Return the ID of the newly created message
			return data;
		} catch (error) {
			console.error("Error creating message:", error);
			throw error;
		}
	}
}
