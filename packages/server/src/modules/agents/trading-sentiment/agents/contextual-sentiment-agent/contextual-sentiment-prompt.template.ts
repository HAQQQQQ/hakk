import { TradingContext } from "../../types/trading-sentiment.types";

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
