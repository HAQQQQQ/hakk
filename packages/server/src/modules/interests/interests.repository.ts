import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";

// In interests module
@Injectable()
export class InterestsRepository {
	constructor(private readonly supabaseService: SupabaseService) {}

	async addInterest(userId: string, newInterests: any[]): Promise<any> {
		const interestToUpsert = newInterests[0];
		const { data, error } = await this.supabaseService.client.from("preferences").upsert(
			[
				{
					user_id: userId,
					interests: interestToUpsert,
				},
			],
			{ onConflict: "user_id" },
		);

		if (error) {
			console.error("Error in addInterest:", error);
			return error;
		}

		return data;
	}
}
