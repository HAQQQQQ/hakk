import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Preference } from "@hakk/types";

@Injectable()
export class PreferenceRepository {
	constructor(private readonly supabaseService: SupabaseService) {}

	// TODO: Move this function out of this class
	async checkUserExists(userId: string): Promise<void> {
		const { data: user, error } = await this.supabaseService.client
			.from("profiles")
			.select("user_id")
			.eq("user_id", userId)
			.single();

		if (error || !user) {
			throw new Error("User not found. Please check the user ID.");
		}
	}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		// Ensure the user exists by calling the new method
		await this.checkUserExists(userId);

		// Insert the preference for the user into the 'preferences' table.
		// Here, the entire preference object is stored in a JSONB column named "data".
		const { data, error } = await this.supabaseService.client.from("preferences").upsert(
			[
				{
					user_id: userId,
					preference: preference, // Stores the entire preference object
				},
			],
			{ onConflict: "user_id" },
		);

		if (error) throw error;

		return data;
	}

	async getPreferences(userIds: string[]): Promise<Preference[]> {
		const { data, error } = await this.supabaseService.client
			.from("preferences")
			.select("preference")
			.in("user_id", userIds);

		if (error) throw error;

		return data.map((item: { preference: Preference }) => item.preference);
	}
}
