// 3. PROMPT TEMPLATES
// src/modules/trading-sentiment/prompts/templates/base.template.ts
export const basePromptTemplate = (journalEntry: string): string => {
	return `Trading Journal Entry: "${journalEntry}"
      
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
};

// src/modules/trading-sentiment/prompts/templates/contextual.template.ts
import { TradingContext } from "../../types/trading-sentiment.types";

export const contextualPromptTemplate = (journalEntry: string, context: TradingContext): string => {
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

// src/modules/trading-sentiment/prompts/templates/trend-analysis.template.ts
import { JournalEntryWithMetadata } from "../../types/trading-sentiment.types";

export const trendAnalysisPromptTemplate = (journalEntries: JournalEntryWithMetadata[]): string => {
	// Sort entries by timestamp
	const sortedEntries = [...journalEntries].sort(
		(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
	);

	// Format entries for the prompt
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

// src/modules/trading-sentiment/prompts/templates/results-analysis.template.ts
import { TradingSessionResults } from "../../types/trading-sentiment.types";

export const resultsAnalysisPromptTemplate = (
	journalEntry: string,
	results: TradingSessionResults,
): string => {
	// Format the trades for the prompt
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

// src/modules/trading-sentiment/prompts/templates/issues.template.ts
export const issuesPromptTemplate = (journalEntry: string): string => {
	return `
    Trading Journal Entry: "${journalEntry}"
    
    Please identify potential trading psychology issues in this journal entry:
    1. Name specific trading psychology issues with confidence levels
    2. Provide evidence from the text for each issue
    3. Assess the potential impact of each issue on trading performance
    4. Recommend specific interventions for each issue
    5. Suggest resources to help address each issue (books, techniques, exercises)
    6. Identify the single highest priority action item
    7. Provide an overall risk assessment of how these psychological factors may affect trading
    `;
};

// src/modules/trading-sentiment/prompts/templates/psychology-plan.template.ts
export const psychologyPlanPromptTemplate = (recentEntries: string[]): string => {
	// Format entries for the prompt
	const entriesFormatted = recentEntries
		.map((entry, index) => `Entry ${index + 1}:\n"${entry}"`)
		.join("\n\n");

	return `
    Review the following recent trading journal entries and create a personalized trading 
    psychology plan to improve the trader's performance:
    
    ${entriesFormatted}
    
    Please create:
    1. A psychological profile identifying strengths, vulnerabilities, emotional triggers, and cognitive patterns
    2. A structured trading psychology plan including:
       - Daily practices for mental preparation
       - Trading session structure recommendations
       - Specific strategies for managing emotional triggers
       - Psychological metrics to track
       - A review process for ongoing improvement
       - Progress milestones to measure psychological development
    3. Implementation steps divided into immediate, short-term, and long-term actions
    `;
};
