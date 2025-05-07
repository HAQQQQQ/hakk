import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../../prompt-builder.interface";

// Define the types for trading results
type TradeResult = {
	ticker: string;
	direction: "long" | "short";
	result: "win" | "loss" | "breakeven";
	profitLoss: number;
	notes?: string;
};

type TradingResults = {
	profitLoss: number;
	trades: TradeResult[];
	sessionNotes?: string;
};

@Injectable()
export class ResultsAnalysisPromptBuilder implements PromptBuilder<string, TradingResults> {
	build(journalEntry: string, options: TradingResults): string {
		// Format the trades for the prompt
		const tradesFormatted = this.formatTrades(options);

		return `
    Trading Journal Entry: "${journalEntry}"
    
    Trading Session Results:
    Overall P&L: ${options.profitLoss >= 0 ? "+" : ""}$${options.profitLoss}
    
    Individual Trades:
    ${tradesFormatted}
    
    ${options.sessionNotes ? `Session Notes: ${options.sessionNotes}` : ""}
    
    Please analyze:
    1. The trading psychology revealed in the journal entry
    2. How psychological factors correlate with actual trading results
    3. Alignment or misalignment between sentiment and performance
    4. Signs of overconfidence or underconfidence relative to results
    5. How accurately the trader's sentiment predicted outcomes
    6. Recommended psychological adjustments based on the performance correlation
    `;
	}

	private formatTrades(options: TradingResults): string {
		return options.trades
			.map(
				(trade) =>
					`- ${trade.ticker} (${trade.direction}): ${trade.result} (${trade.profitLoss >= 0 ? "+" : ""}$${trade.profitLoss})${trade.notes ? ` - ${trade.notes}` : ""}`,
			)
			.join("\n");
	}
}
