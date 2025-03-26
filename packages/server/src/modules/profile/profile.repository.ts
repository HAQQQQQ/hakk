import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class ProfileRepository {
	private readonly PROFILES_TABLE: string = "profiles";

	constructor(private readonly supabaseService: SupabaseService) {}

	async checkUserExists(userId: string): Promise<boolean> {
		const { data: user, error } = await this.supabaseService.client
			.from(this.PROFILES_TABLE)
			.select("user_id")
			.eq("user_id", userId)
			.single();

		return !!user && !error;
	}

	// TODO: Move this function out of this class
	async getUsers(): Promise<any> {
		console.log("Fetching users from Supabase...");
		const { data, error } = await this.supabaseService.client.from("users").select("*");
		if (error) throw error;
		return data;
	}
}
