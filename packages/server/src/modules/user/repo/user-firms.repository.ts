// src/modules/user/repo/user-firms.repository.ts
import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { SupabaseService } from "@/modules/supabase/supabase.service";
import { BrokerageFirm } from "@/modules/pnl-data/types/brokerage-firm.enum";

@Injectable()
export class UserFirmsRepository {
	private readonly USER_FIRMS_TABLE = "user_firms";

	constructor(private readonly supabaseService: SupabaseService) {}

	/**
	 * Find the user_firm_id for a given user and firm.
	 * Throws NotFoundException if no matching row exists.
	 */
	async findUserFirmId(userId: string, firm: BrokerageFirm): Promise<number> {
		try {
			const { data, error } = await this.supabaseService.client
				.from(this.USER_FIRMS_TABLE)
				.select("id")
				.eq("user_id", userId)
				.eq("firm", firm)
				.single();

			if (error && error.code !== "PGRST116") {
				// PGRST116 = “No rows returned” in Supabase/PostgREST
				throw new InternalServerErrorException(`DB error: ${error.message}`);
			}

			if (!data) {
				throw new NotFoundException(
					`No user_firm found for user ${userId} and firm ${firm}`,
				);
			}

			return data.id as number;
		} catch (err) {
			if (err instanceof NotFoundException || err instanceof InternalServerErrorException) {
				throw err;
			}
			throw new InternalServerErrorException(`Failed to lookup user_firm: ${err.message}`);
		}
	}
}
