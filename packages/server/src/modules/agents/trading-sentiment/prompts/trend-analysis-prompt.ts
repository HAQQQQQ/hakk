import { Injectable } from "@nestjs/common";
import { PromptBuilder } from "../prompt-builder.interface";

// Define the type for journal entries
type JournalEntryWithMetadata = {
	entry: string;
	timestamp: Date;
	tradingResults?: string;
	marketConditions?: string;
};

@Injectable()
export class TrendAnalysisPromptBuilder implements PromptBuilder<JournalEntryWithMetadata[]> {
	build(journalEntries: JournalEntryWithMetadata[]): string {
		// Sort entries by timestamp
		const sortedEntries = this.sortEntries(journalEntries);

		// Format entries for the prompt
		const entriesFormatted = this.formatEntities(sortedEntries);

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
	}

	private sortEntries(entries: JournalEntryWithMetadata[]): JournalEntryWithMetadata[] {
		return [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	}

	private formatEntities(entries: JournalEntryWithMetadata[]): string {
		return entries
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
	}
}
