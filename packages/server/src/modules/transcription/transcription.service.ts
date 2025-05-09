// import { Injectable } from "@nestjs/common";
// import { TranscriptionRepository } from "./transcription.repository";
// import { AgentFactory, AgentName } from "../agents/agent.factory";
// import {
// 	TradingContext,
// 	TradingPsychologyPlan,
// 	TradingSentimentAnalysis,
// 	TradingSentimentPerformanceAnalysis,
// } from "../agents/trading-sentiment/types/trading-sentiment.types";

// @Injectable()
// export class TranscriptionService {
// 	constructor(
// 		private readonly transcriptionRepository: TranscriptionRepository,
// 		private readonly agentFactory: AgentFactory,
// 	) {}

// 	/**
// 	 * Analyze a trading journal entry for sentiment and psychological patterns
// 	 */
// 	async analyzeTradingJournal(journalEntry: string): Promise<TradingSentimentAnalysis> {
// 		// Get the trading sentiment agent from the factory
// 		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);

// 		// Execute the analysis
// 		return tradingSentimentAgent.execute(journalEntry);
// 	}

// 	/**
// 	 * Analyze with trading context
// 	 */
// 	async analyzeWithContext(
// 		journalEntry: string,
// 		context: TradingContext,
// 	): Promise<TradingSentimentAnalysis> {
// 		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);
// 		return tradingSentimentAgent.executeWithContext(journalEntry, context);
// 	}

// 	/**
// 	 * Analyze trading results correlation with psychology
// 	 */
// 	async analyzeTradeResults(
// 		journalEntry: string,
// 		profitLoss: number,
// 		trades: Array<{
// 			ticker: string;
// 			direction: "long" | "short";
// 			result: "win" | "loss" | "breakeven";
// 			profitLoss: number;
// 			notes?: string;
// 		}>,
// 	): Promise<TradingSentimentPerformanceAnalysis> {
// 		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);

// 		return tradingSentimentAgent.analyzeWithResults(journalEntry, {
// 			profitLoss,
// 			trades,
// 			sessionNotes: "Analysis requested through TradingJournalService",
// 		});
// 	}

// 	/**
// 	 * Create a trading psychology improvement plan
// 	 */
// 	async createPsychologyPlan(journalEntries: string[]): Promise<TradingPsychologyPlan> {
// 		const tradingSentimentAgent = this.agentFactory.get(AgentName.TRADING_SENTIMENT_ANALYSIS);
// 		return tradingSentimentAgent.createTradingPsychologyPlan(journalEntries);
// 	}
// }

// trading-sentiment.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { TradingSentimentAnalysisAgent } from "./agents/trading-sentiment-analysis-agent";
import { ContextualTradingSentimentAgent } from "./agents/contextual-sentiment-agent";
import { TradingSentimentTrendAgent } from "./agents/trend-analysis-agent";
import { TradingSentimentPerformanceAgent } from "./agents/performance-analysis-agent";
import { PsychologicalIssuesAgent } from "./agents/psychological-issues-agent";
import { TradingPsychologyPlanAgent } from "./agents/psychology-plan-agent";
import {
	TradingSentimentAnalysis,
	TradingSentimentTrendAnalysis,
	TradingSentimentPerformanceAnalysis,
	PsychologicalIssuesAnalysis,
	TradingPsychologyPlan,
	TradingContext,
	JournalEntryWithMetadata,
	TradingSessionResults,
} from "./types/trading-sentiment.types";
import { AnalysisType, AnalysisConfig, MultiAnalysisResponse } from "./types/analysis-config.types";

@Injectable()
export class TradingSentimentService {
	constructor(
		private readonly sentimentAgent: TradingSentimentAnalysisAgent,
		private readonly contextualAgent: ContextualTradingSentimentAgent,
		private readonly trendAgent: TradingSentimentTrendAgent,
		private readonly performanceAgent: TradingSentimentPerformanceAgent,
		private readonly issuesAgent: PsychologicalIssuesAgent,
		private readonly planAgent: TradingPsychologyPlanAgent,
	) {}

	/**
	 * Basic trading journal analysis
	 */
	async analyzeTradingJournal(journalEntry: string): Promise<TradingSentimentAnalysis> {
		return this.sentimentAgent.execute({ journalEntry });
	}

	/**
	 * Contextual trading journal analysis
	 */
	async analyzeWithContext(
		journalEntry: string,
		context: TradingContext,
	): Promise<TradingSentimentAnalysis> {
		return this.contextualAgent.execute({ journalEntry, context });
	}

	/**
	 * Trading trend analysis
	 */
	async analyzeTrend(
		journalEntries: JournalEntryWithMetadata[],
	): Promise<TradingSentimentTrendAnalysis> {
		return this.trendAgent.execute({ journalEntries });
	}

	/**
	 * Trading performance analysis
	 */
	async analyzeWithResults(
		journalEntry: string,
		results: TradingSessionResults,
	): Promise<TradingSentimentPerformanceAnalysis> {
		return this.performanceAgent.execute({ journalEntry, results });
	}

	/**
	 * Psychological issues analysis
	 */
	async identifyPsychologicalIssues(journalEntry: string): Promise<PsychologicalIssuesAnalysis> {
		return this.issuesAgent.execute({ journalEntry });
	}

	/**
	 * Trading psychology plan
	 */
	async createTradingPsychologyPlan(recentEntries: string[]): Promise<TradingPsychologyPlan> {
		return this.planAgent.execute({ recentEntries });
	}

	/**
	 * Run multiple analyses based on configuration
	 */
	async runAnalyses(config: AnalysisConfig): Promise<MultiAnalysisResponse> {
		this.validateConfig(config);

		// Set up response object
		const response: MultiAnalysisResponse = {};

		// Process each requested analysis type in parallel
		await Promise.all(
			config.analysisTypes.map(async (type) => {
				switch (type) {
					case AnalysisType.BASIC:
						if (!config.journalEntry) break;
						response.basic = await this.analyzeTradingJournal(config.journalEntry);
						break;

					case AnalysisType.CONTEXTUAL:
						if (!config.journalEntry || !config.context) break;
						response.contextual = await this.analyzeWithContext(
							config.journalEntry,
							config.context,
						);
						break;

					case AnalysisType.TREND:
						if (!config.journalHistory) break;
						response.trend = await this.analyzeTrend(config.journalHistory);
						break;

					case AnalysisType.PERFORMANCE:
						if (!config.journalEntry || !config.results) break;
						response.performance = await this.analyzeWithResults(
							config.journalEntry,
							config.results,
						);
						break;

					case AnalysisType.PSYCHOLOGICAL_ISSUES:
						if (!config.journalEntry) break;
						response.psychologicalIssues = await this.identifyPsychologicalIssues(
							config.journalEntry,
						);
						break;

					case AnalysisType.PSYCHOLOGY_PLAN:
						if (!config.recentEntries) break;
						response.psychologyPlan = await this.createTradingPsychologyPlan(
							config.recentEntries,
						);
						break;
				}
			}),
		);

		return response;
	}

	/**
	 * Validate the analysis configuration
	 */
	private validateConfig(config: AnalysisConfig): void {
		if (!config.analysisTypes || config.analysisTypes.length === 0) {
			throw new BadRequestException("At least one analysis type must be specified");
		}

		// Check for required parameters for each analysis type
		for (const type of config.analysisTypes) {
			switch (type) {
				case AnalysisType.BASIC:
				case AnalysisType.PSYCHOLOGICAL_ISSUES:
					if (!config.journalEntry) {
						throw new BadRequestException(
							`journalEntry is required for ${type} analysis`,
						);
					}
					break;

				case AnalysisType.CONTEXTUAL:
					if (!config.journalEntry) {
						throw new BadRequestException(
							`journalEntry is required for ${type} analysis`,
						);
					}
					if (!config.context) {
						throw new BadRequestException(`context is required for ${type} analysis`);
					}
					break;

				case AnalysisType.TREND:
					if (!config.journalHistory || !config.journalHistory.length) {
						throw new BadRequestException(
							`journalHistory is required for ${type} analysis`,
						);
					}
					break;

				case AnalysisType.PERFORMANCE:
					if (!config.journalEntry) {
						throw new BadRequestException(
							`journalEntry is required for ${type} analysis`,
						);
					}
					if (!config.results) {
						throw new BadRequestException(`results is required for ${type} analysis`);
					}
					break;

				case AnalysisType.PSYCHOLOGY_PLAN:
					if (!config.recentEntries || !config.recentEntries.length) {
						throw new BadRequestException(
							`recentEntries is required for ${type} analysis`,
						);
					}
					break;
			}
		}
	}
}
