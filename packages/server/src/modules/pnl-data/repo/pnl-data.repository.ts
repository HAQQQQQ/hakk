import { SupabaseService } from "@/modules/supabase/supabase.service";
import { Injectable } from "@nestjs/common";

export interface InsertTradeDto {
	user_id: string;
	firm: string;
	records: any[];
	min_time: Date;
	max_time: Date;
}

@Injectable()
export class PnlDataRepository {
	private readonly TRADES_JSON_TABLE: string = "trades_json";

	constructor(private readonly supabaseService: SupabaseService) {}

	/**
	 * Persists the parsed trade data to Supabase
	 * @param tradeRecords - Array of trade records to insert
	 * @returns Array of inserted records
	 */
	async insertTrades(tradeRecords: InsertTradeDto): Promise<any[]> {
		try {
			const { data, error } = await this.supabaseService.client
				.from(this.TRADES_JSON_TABLE)
				.insert(tradeRecords)
				.select();

			if (error) {
				console.error("Supabase insertion error:", error);
				throw new Error(`Failed to insert trades: ${error.message}`);
			}

			return data || [];
		} catch (error) {
			console.error("Error in insertTrades:", error);
			throw error;
		}
	}
}
