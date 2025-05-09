import { Injectable } from "@nestjs/common";
import { ContextualAnalysisParams } from "../../__trading-sentiment/analysis/agent-params.types";
import { PromptBuilder } from "../../prompt-builder.interface";
import { TradingContext } from "../../__trading-sentiment/types/trading-sentiment.types";

@Injectable()
export class ContextualSentimentPromptBuilder implements PromptBuilder<ContextualAnalysisParams> {
	build(params: ContextualAnalysisParams): string {
		return contextualSentimentPromptTemplate(params.journalEntry, params.context);
	}
}

export const contextualSentimentPromptTemplate = (
	journalEntry: string,
	context: TradingContext,
): string => {
	return `
    Trading Journal Entry: "${journalEntry}"
    
    Trading Context:
    ${context.tradingStyle ? `Trading Style: ${context.tradingStyle}` : ""}
    ${context.marketContext ? `Market Context: ${context.marketContext}` : ""}
    ${context.accountSize ? `Account Size: ${context.accountSize}` : ""}
    ${context.experience ? `Experience Level: ${context.experience}` : ""}
    ${context.recentPerformance ? `Recent Performance: ${context.recentPerformance}` : ""}
    ${context.knownPatterns?.length ? `Known Psychological Patterns: ${context.knownPatterns.join(", ")}` : ""}
    ${context.tradingPlan ? `Today's Trading Plan: ${context.tradingPlan}` : ""}
    ${context.tickers?.length ? `Tickers Being Traded: ${context.tickers.join(", ")}` : ""}
    
    Please analyze this trading journal entry considering the provided context.`;
};
