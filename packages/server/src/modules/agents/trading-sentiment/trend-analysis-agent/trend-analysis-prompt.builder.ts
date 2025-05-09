import { Injectable } from "@nestjs/common";
import { JournalEntryWithMetadata } from "../../__trading-sentiment/types/trading-sentiment.types";
import { TrendAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PromptBuilder } from "../../prompt-builder.interface";

@Injectable()
export class TrendAnalysisPromptBuilder implements PromptBuilder<TrendAnalysisParams> {
	build(params: TrendAnalysisParams): string {
		return trendAnalysisPromptTemplate(params.journalEntries);
	}
}

export const trendAnalysisPromptTemplate = (journalEntries: JournalEntryWithMetadata[]): string => {
	const sortedEntries = [...journalEntries].sort(
		(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
	);

	const entriesFormatted = sortedEntries
		.map((entry) => {
			let entryText = `[${entry.timestamp.toISOString()}]: "${entry.entry}"`;
			if (entry.tradingResults) {
				entryText += `\nTrading Results: ${entry.tradingResults}`;
			}
			if (entry.marketConditions) {
				entryText += `\nMarket Conditions: ${entry.marketConditions}`;
			}
			return entryText;
		})
		.join("\n\n");

	return `
    Analyze the following series of trading journal entries chronologically to identify 
    psychological trends and patterns:
    
    ${entriesFormatted}
    
    Please provide:
    1. A comprehensive analysis of the latest journal entry
    2. Analysis of trading psychology trends over time
    3. Identification of emotional, disciplinary, risk management, and decision quality trends
    4. Significant psychological changes and their likely triggers
    5. Evidence of habit formation (positive and negative)
    6. Prioritized interventions to improve trading psychology
    `;
};
