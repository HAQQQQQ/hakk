import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service.js";
import { InterestAnalysis } from "./interests.types.js";

// In interests module
@Injectable()
export class InterestsRepository {
	// TODO: Delete this class move to Preferences repository
	private readonly PREFERENCES_TABLE: string = "preferences";

	constructor(private readonly supabaseService: SupabaseService) {}

	async addInterest(userId: string, newInterests: InterestAnalysis[]): Promise<any> {
		console.log("In InterestsRepository.addInterest");
		const interestToUpsert = newInterests[0];
		const { data, error } = await this.supabaseService.client
			.from(this.PREFERENCES_TABLE)
			.upsert(
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

	async getInterestsByUserId(userId: string): Promise<any> {
		console.log("In InterestsRepository.getInterestsByUserId");
		const { data, error } = await this.supabaseService.client
			.from(this.PREFERENCES_TABLE)
			.select("interests")
			.eq("user_id", userId)
			.single();

		if (error) {
			console.error("Error in getInterestsByUserId:", error);
			return error;
		}

		return data;
	}
}
