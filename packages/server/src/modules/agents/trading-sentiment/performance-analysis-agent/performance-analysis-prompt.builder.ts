import { Injectable } from "@nestjs/common";
import { TradingSessionResults } from "../../__trading-sentiment/types/trading-sentiment.types";
import { PerformanceAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PromptBuilder } from "../../prompt-builder.interface";

@Injectable()
export class PerformanceAnalysisPromptBuilder implements PromptBuilder<PerformanceAnalysisParams> {
	build(params: PerformanceAnalysisParams): string {
		return performanceAnalysisPromptTemplate(params.journalEntry, params.results);
	}
}

export const performanceAnalysisPromptTemplate = (
	journalEntry: string,
	results: TradingSessionResults,
): string => {
	const tradesFormatted = results.trades
		.map(
			(trade) =>
				`- ${trade.ticker} (${trade.direction}): ${trade.result} (${
					trade.profitLoss >= 0 ? "+" : ""
				}$${trade.profitLoss})${trade.notes ? ` - ${trade.notes}` : ""}`,
		)
		.join("\n");

	return `
    Trading Journal Entry: "${journalEntry}"
    
    Trading Session Results:
    Overall P&L: ${results.profitLoss >= 0 ? "+" : ""}$${results.profitLoss}
    
    Individual Trades:
    ${tradesFormatted}
    
    ${results.sessionNotes ? `Session Notes: ${results.sessionNotes}` : ""}
    
    Please analyze:
    1. The trading psychology revealed in the journal entry
    2. How psychological factors correlate with actual trading results
    3. Alignment or misalignment between sentiment and performance
    4. Signs of overconfidence or underconfidence relative to results
    5. How accurately the trader's sentiment predicted outcomes
    6. Recommended psychological adjustments based on the performance correlation
    `;
};
