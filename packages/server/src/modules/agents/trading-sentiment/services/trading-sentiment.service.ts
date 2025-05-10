// trading-sentiment.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { SentimentAnalysisAgent } from "../agents/sentiment-analysis-agent/trading-sentiment-analysis.agent";
import { ContextualSentimentAgent } from "../agents/contextual-sentiment-agent/contextual-sentiment-analysis.agent";
import { TrendAnalysisAgent } from "../agents/trend-analysis-agent/trend-analysis.agent";
import { PerformanceAnalysisAgent } from "../agents/performance-analysis-agent/performance-analysis.agent";
import { PsychologicalAnalysisAgent } from "../agents/psychological-issues-agent/psychological-issues-analysis.agent";
import { PsychologyPlanAgent } from "../agents/psychology-plan-agent/psychology-plan-analysis.agent";
import {
	ContextualAnalysisParams,
	JournalEntryParams,
	PerformanceAnalysisParams,
	PsychologicalIssuesParams,
	PsychologyPlanParams,
	TrendAnalysisParams,
} from "../types/agent-params.types";
import { CoreSentimentAnalysis } from "../agents/sentiment-analysis-agent/core-sentiment.schema";
import { TrendAnalysisResponse } from "../agents/trend-analysis-agent/trend-analysis-response.schema";
import { PerformanceAnalysisResponse } from "../agents/performance-analysis-agent/performance-analysis.schema";
import { PsychologicalIssuesResponse } from "../agents/psychological-issues-agent/psychological-issues.schema";
import { PsychologyPlanResponse } from "../agents/psychology-plan-agent/psychology-plan-response.schema";
import { CognitiveBiasAnalysis } from "../agents/contextual-sentiment-agent/cognitive-bias.schema";

@Injectable()
export class TradingSentimentService {
	constructor(
		private readonly sentimentAgent: SentimentAnalysisAgent,
		private readonly contextualAgent: ContextualSentimentAgent,
		private readonly trendAgent: TrendAnalysisAgent,
		private readonly performanceAgent: PerformanceAnalysisAgent,
		private readonly psychologicalAgent: PsychologicalAnalysisAgent,
		private readonly psychologyPlanAgent: PsychologyPlanAgent,
	) {}

	/**
	 * Basic trading journal sentiment analysis
	 */
	async analyzeSentiment(params: JournalEntryParams): Promise<CoreSentimentAnalysis> {
		return this.sentimentAgent.execute(params);
	}

	/**
	 * Contextual trading journal analysis
	 */
	async analyzeWithContext(params: ContextualAnalysisParams): Promise<CognitiveBiasAnalysis> {
		return this.contextualAgent.execute(params);
	}

	/**
	 * Trading trend analysis
	 */
	async analyzeTrend(params: TrendAnalysisParams): Promise<TrendAnalysisResponse> {
		return this.trendAgent.execute(params);
	}

	/**
	 * Trading performance analysis
	 */
	async analyzePerformance(
		params: PerformanceAnalysisParams,
	): Promise<PerformanceAnalysisResponse> {
		return this.performanceAgent.execute(params);
	}

	/**
	 * Psychological issues analysis
	 */
	async analyzePsychologicalIssues(
		params: PsychologicalIssuesParams,
	): Promise<PsychologicalIssuesResponse> {
		return this.psychologicalAgent.execute(params);
	}

	/**
	 * Trading psychology plan
	 */
	async createPsychologyPlan(params: PsychologyPlanParams): Promise<PsychologyPlanResponse> {
		return this.psychologyPlanAgent.execute(params);
	}

	// /**
	//  * Run multiple analyses based on configuration
	//  * @param config Analysis configuration specifying which analyses to run
	//  */
	// async runAnalyses(config: AnalysisConfig): Promise<MultiAnalysisResponse> {
	//     this.validateConfig(config);

	//     // Set up response object
	//     const response: MultiAnalysisResponse = {};

	//     // Process each requested analysis type in parallel
	//     await Promise.all(config.analysisTypes.map(async (type) => {
	//         try {
	//             switch (type) {
	//                 case AnalysisType.SENTIMENT:
	//                     if (!config.journalEntry) break;
	//                     response.sentiment = await this.analyzeSentiment({
	//                         journalEntry: config.journalEntry
	//                     });
	//                     break;

	//                 case AnalysisType.CONTEXTUAL:
	//                     if (!config.journalEntry || !config.context) break;
	//                     response.contextual = await this.analyzeWithContext({
	//                         journalEntry: config.journalEntry,
	//                         context: config.context
	//                     });
	//                     break;

	//                 case AnalysisType.TREND:
	//                     if (!config.journalEntries) break;
	//                     response.trend = await this.analyzeTrend({
	//                         journalEntries: config.journalEntries
	//                     });
	//                     break;

	//                 case AnalysisType.PERFORMANCE:
	//                     if (!config.journalEntry || !config.results) break;
	//                     response.performance = await this.analyzePerformance({
	//                         journalEntry: config.journalEntry,
	//                         results: config.results
	//                     });
	//                     break;

	//                 case AnalysisType.PSYCHOLOGICAL_ISSUES:
	//                     if (!config.journalEntry) break;
	//                     response.psychologicalIssues = await this.analyzePsychologicalIssues({
	//                         journalEntry: config.journalEntry
	//                     });
	//                     break;

	//                 case AnalysisType.PSYCHOLOGY_PLAN:
	//                     if (!config.recentEntries) break;
	//                     response.psychologyPlan = await this.createPsychologyPlan({
	//                         recentEntries: config.recentEntries
	//                     });
	//                     break;
	//             }
	//         } catch (error) {
	//             // Log the error but continue with other analyses
	//             console.error(`Error running ${type} analysis:`, error);
	//             response[type] = { error: `Analysis failed: ${error.message}` };
	//         }
	//     }));

	//     return response;
	// }

	// /**
	//  * Validate the analysis configuration
	//  */
	// private validateConfig(config: AnalysisConfig): void {
	//     if (!config.analysisTypes || config.analysisTypes.length === 0) {
	//         throw new BadRequestException('At least one analysis type must be specified');
	//     }

	//     // Check for required parameters for each analysis type
	//     for (const type of config.analysisTypes) {
	//         switch (type) {
	//             case AnalysisType.SENTIMENT:
	//             case AnalysisType.PSYCHOLOGICAL_ISSUES:
	//                 if (!config.journalEntry) {
	//                     throw new BadRequestException(`journalEntry is required for ${type} analysis`);
	//                 }
	//                 break;

	//             case AnalysisType.CONTEXTUAL:
	//                 if (!config.journalEntry) {
	//                     throw new BadRequestException(`journalEntry is required for ${type} analysis`);
	//                 }
	//                 if (!config.context) {
	//                     throw new BadRequestException(`context is required for ${type} analysis`);
	//                 }
	//                 break;

	//             case AnalysisType.TREND:
	//                 if (!config.journalEntries || !config.journalEntries.length) {
	//                     throw new BadRequestException(`journalEntries is required for ${type} analysis`);
	//                 }
	//                 break;

	//             case AnalysisType.PERFORMANCE:
	//                 if (!config.journalEntry) {
	//                     throw new BadRequestException(`journalEntry is required for ${type} analysis`);
	//                 }
	//                 if (!config.results) {
	//                     throw new BadRequestException(`results is required for ${type} analysis`);
	//                 }
	//                 break;

	//             case AnalysisType.PSYCHOLOGY_PLAN:
	//                 if (!config.recentEntries || !config.recentEntries.length) {
	//                     throw new BadRequestException(`recentEntries is required for ${type} analysis`);
	//                 }
	//                 break;
	//         }
	//     }
	// }
}
