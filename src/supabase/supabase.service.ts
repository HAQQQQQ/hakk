import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Preference } from "../types/common.types";

@Injectable()
export class SupabaseService {
	private supabase: SupabaseClient;

	constructor() {
		const SUPABASE_URL = process.env.SUPABASE_URL;
		const SUPABASE_KEY = process.env.SUPABASE_KEY;

		if (!SUPABASE_URL || !SUPABASE_KEY) {
			throw new Error("Supabase credentials are missing. Check your environment variables.");
		}

		this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
	}

	async getUsers(): Promise<any> {
		console.log("Fetching users from Supabase...");
		const { data, error } = await this.supabase.from("users").select("*");
		if (error) throw error;
		return data;
	}

	async checkUserExists(userId: string): Promise<void> {
		const { data: user, error } = await this.supabase
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
		const { data, error } = await this.supabase.from("preferences").upsert(
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
}
