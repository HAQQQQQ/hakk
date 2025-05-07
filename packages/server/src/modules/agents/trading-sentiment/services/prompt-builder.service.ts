import { Injectable } from "@nestjs/common";
import { TradingContext } from "../types/trading-sentiment.types";
import { BasePromptBuilder } from "../prompts/base-prompt";
import { ContextualPromptBuilder } from "../prompts/contextual-prompt";
import { TrendAnalysisPromptBuilder } from "../prompts/trend-analysis-prompt";
import { ResultsAnalysisPromptBuilder } from "../prompts/results-analysis-prompt";
import { IssuesPromptBuilder } from "../prompts/issues-prompt";
import { PsychologyPlanPromptBuilder } from "../prompts/psychology-plan-prompt";

@Injectable()
export class TradingPromptBuilderService {
	constructor(
		private readonly basePromptBuilder: BasePromptBuilder,
		private readonly contextualPromptBuilder: ContextualPromptBuilder,
		private readonly trendAnalysisPromptBuilder: TrendAnalysisPromptBuilder,
		private readonly resultsAnalysisPromptBuilder: ResultsAnalysisPromptBuilder,
		private readonly issuesPromptBuilder: IssuesPromptBuilder,
		private readonly psychologyPlanPromptBuilder: PsychologyPlanPromptBuilder,
	) {}

	/**
	 * Build a basic prompt for trading sentiment analysis
	 */
	buildBasePrompt(journalEntry: string): string {
		return this.basePromptBuilder.build(journalEntry);
	}

	/**
	 * Build a prompt with additional trading context
	 */
	buildContextualPrompt(journalEntry: string, context: TradingContext): string {
		return this.contextualPromptBuilder.build(journalEntry, context);
	}

	/**
	 * Build a prompt for trend analysis across multiple journal entries
	 */
	buildTrendAnalysisPrompt(
		journalEntries: Array<{
			entry: string;
			timestamp: Date;
			tradingResults?: string;
			marketConditions?: string;
		}>,
	): string {
		return this.trendAnalysisPromptBuilder.build(journalEntries);
	}

	/**
	 * Build a prompt for analysis with trading results
	 */
	buildResultsAnalysisPrompt(
		journalEntry: string,
		results: {
			profitLoss: number;
			trades: Array<{
				ticker: string;
				direction: "long" | "short";
				result: "win" | "loss" | "breakeven";
				profitLoss: number;
				notes?: string;
			}>;
			sessionNotes?: string;
		},
	): string {
		return this.resultsAnalysisPromptBuilder.build(journalEntry, results);
	}

	/**
	 * Build a prompt for psychological issues identification
	 */
	buildIssuesPrompt(journalEntry: string): string {
		return this.issuesPromptBuilder.build(journalEntry);
	}

	/**
	 * Build a prompt for creating a trading psychology plan
	 */
	buildPsychologyPlanPrompt(recentEntries: string[]): string {
		return this.psychologyPlanPromptBuilder.build(recentEntries);
	}
}
