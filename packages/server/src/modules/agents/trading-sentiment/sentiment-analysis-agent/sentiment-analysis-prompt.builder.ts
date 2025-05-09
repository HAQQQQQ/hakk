import { Injectable } from "@nestjs/common";
import { JournalEntryParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PromptBuilder } from "../../prompt-builder.interface";

@Injectable()
export class SentimentAnalysisPromptBuilder implements PromptBuilder<JournalEntryParams> {
	build(params: JournalEntryParams): string {
		return sentimentAnalysisPromptTemplate(params.journalEntry);
	}
}

export const sentimentAnalysisPromptTemplate = (journalEntry: string): string => {
	return `Trading Journal Entry: "${journalEntry}"
      
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
};
