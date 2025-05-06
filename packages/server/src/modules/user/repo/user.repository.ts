import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service";

@Injectable()
export class UserRepository {
	private readonly USER_TABLE: string = "user";

	constructor(private readonly supabaseService: SupabaseService) {}

	async checkUserExists(userId: string): Promise<boolean> {
		const { data: user, error } = await this.supabaseService.client
			.from(this.USER_TABLE)
			.select("user_id")
			.eq("user_id", userId)
			.single();

		return !!user && !error;
	}
}
