import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { Preference } from "@hakk/types";

@Injectable()
export class PreferenceRepository {
	private readonly PREFERENCES_TABLE: string = "preferences";

	constructor(private readonly supabaseService: SupabaseService) {}

	async addPreference(userId: string, preference: Preference): Promise<any> {
		// Insert the preference for the user into the 'preferences' table.
		// Here, the entire preference object is stored in a JSONB column named "data".
		const { data, error } = await this.supabaseService.client
			.from(this.PREFERENCES_TABLE)
			.upsert(
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
			.from(this.PREFERENCES_TABLE)
			.select("preference")
			.in("user_id", userIds);

		if (error) throw error;

		return data.map((item: { preference: Preference }) => item.preference);
	}
}
