import { SupabaseService } from "@/modules/supabase/supabase.service";
import { Injectable } from "@nestjs/common";
import { CSVRecord, ImportResult } from "../services/data.service";

@Injectable()
export class DataRepository {
	private readonly TRADES_JSON_TABLE: string = "trades_json";

	constructor(private readonly supabaseService: SupabaseService) {}

	/**
	 * Persists the parsed trade data to Supabase
	 * @param tradeRecords - Array of trade records to insert
	 * @returns Array of inserted records
	 */
	async insertTrades<T extends CSVRecord>(tradeRecords: ImportResult<T>): Promise<any[]> {
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
