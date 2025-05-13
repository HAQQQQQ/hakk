// types/agent-params.types.ts

// types/agent-params.types.ts

// Base parameter interface for journal entries
export interface JournalEntryParams {
	journalEntry: string;
}

// Parameter interface for contextual analysis
export interface ContextualAnalysisParams extends JournalEntryParams {
	context: TradingContext;
}

// Parameter interface for performance analysis
export interface PerformanceAnalysisParams extends JournalEntryParams {
	results: TradingSessionResults;
}

// Parameter interface for trend analysis
export interface TrendAnalysisParams {
	journalEntries: JournalEntryWithMetadata[];
}

// Parameter interface for psychology plan
export interface PsychologyPlanParams {
	recentEntries: string[];
}

// Parameter interface for psychological issues analysis
export type PsychologicalIssuesParams = JournalEntryParams;

export interface TradingContext {
	tradingStyle?: "day trading" | "swing trading" | "scalping" | "position trading";
	marketContext?: string;
	accountSize?: string;
	experience?: "beginner" | "intermediate" | "experienced" | "professional";
	recentPerformance?: string;
	knownPatterns?: string[];
	tradingPlan?: string;
	tickers?: string[];
}

export interface JournalEntryWithMetadata {
	entry: string;
	timestamp: Date;
	tradingResults?: string;
	marketConditions?: string;
}

/**
 * Information about a specific trade
 */
export interface TradeInfo {
	ticker: string;
	direction: "long" | "short";
	result: "win" | "loss" | "breakeven";
	profitLoss: number;
	notes?: string;
}

/**
 * Complete trading session results
 */
export interface TradingSessionResults {
	profitLoss: number;
	trades: TradeInfo[];
	sessionNotes?: string;
}
