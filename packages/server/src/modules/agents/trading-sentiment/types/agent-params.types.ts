// types/agent-params.types.ts

import {
	JournalEntryWithMetadata,
	TradingContext,
	TradingSessionResults,
} from "./trading-sentiment.types";

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
