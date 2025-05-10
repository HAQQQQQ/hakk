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
import { AgentFactory } from "../../agent.factory";
import { AgentName } from "../../agent-name.enum";
import { GeneralAnalysisAgent } from "../agents/general-analysis-agent/general-analysis.agent";
import { GeneralTradingAnalysis } from "../agents/general-analysis-agent/general-analysis.schema";

@Injectable()
export class TradingSentimentService {
	constructor(private readonly agentFactory: AgentFactory) {}

	//     /**
	//  * Run multiple analyses in parallel with error handling
	//  */
	//     async runParallelAnalyses(config: {
	//         sentiment?: JournalEntryParams;
	//         contextual?: ContextualAnalysisParams;
	//         trend?: TrendAnalysisParams;
	//         performance?: PerformanceAnalysisParams;
	//         psychologicalIssues?: PsychologicalIssuesParams;
	//         psychologyPlan?: PsychologyPlanParams;
	//     }): Promise<{
	//         sentiment?: CoreSentimentAnalysis | { error: string };
	//         contextual?: CognitiveBiasAnalysis | { error: string };
	//         trend?: TrendAnalysisResponse | { error: string };
	//         performance?: PerformanceAnalysisResponse | { error: string };
	//         psychologicalIssues?: PsychologicalIssuesResponse | { error: string };
	//         psychologyPlan?: PsychologyPlanResponse | { error: string };
	//     }> {
	//         const result: any = {};

	//         // Create an array of functions to execute in parallel
	//         const tasks = [
	//             {
	//                 key: 'sentiment',
	//                 fn: async () => {
	//                     if (config.sentiment) {
	//                         try {
	//                             result.sentiment = await this.analyzeSentiment(config.sentiment);
	//                         } catch (error) {
	//                             result.sentiment = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             },
	//             {
	//                 key: 'contextual',
	//                 fn: async () => {
	//                     if (config.contextual) {
	//                         try {
	//                             result.contextual = await this.analyzeWithContext(config.contextual);
	//                         } catch (error) {
	//                             result.contextual = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             },
	//             {
	//                 key: 'trend',
	//                 fn: async () => {
	//                     if (config.trend) {
	//                         try {
	//                             result.trend = await this.analyzeTrend(config.trend);
	//                         } catch (error) {
	//                             result.trend = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             },
	//             {
	//                 key: 'performance',
	//                 fn: async () => {
	//                     if (config.performance) {
	//                         try {
	//                             result.performance = await this.analyzePerformance(config.performance);
	//                         } catch (error) {
	//                             result.performance = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             },
	//             {
	//                 key: 'psychologicalIssues',
	//                 fn: async () => {
	//                     if (config.psychologicalIssues) {
	//                         try {
	//                             result.psychologicalIssues = await this.analyzePsychologicalIssues(config.psychologicalIssues);
	//                         } catch (error) {
	//                             result.psychologicalIssues = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             },
	//             {
	//                 key: 'psychologyPlan',
	//                 fn: async () => {
	//                     if (config.psychologyPlan) {
	//                         try {
	//                             result.psychologyPlan = await this.createPsychologyPlan(config.psychologyPlan);
	//                         } catch (error) {
	//                             result.psychologyPlan = { error: error.message || 'Unknown error' };
	//                         }
	//                     }
	//                 }
	//             }
	//         ];

	//         // Filter tasks based on config
	//         const applicableTasks = tasks.filter(task => config[task.key]);

	//         // Execute all applicable tasks in parallel
	//         await Promise.all(applicableTasks.map(task => task.fn()));

	//         return result;
	//     }

	/**
	 * General high level analysis of everything
	 */
	async generalAnalysis(params: JournalEntryParams): Promise<GeneralTradingAnalysis> {
		const agent: GeneralAnalysisAgent = this.agentFactory.getAgent(
			AgentName.GENERAL_TRADING_ANALYSIS_AGENT,
		);
		return agent.execute(params);
	}

	/**
	 * Basic trading journal sentiment analysis
	 */
	async analyzeSentiment(params: JournalEntryParams): Promise<CoreSentimentAnalysis> {
		const agent: SentimentAnalysisAgent = this.agentFactory.getAgent(
			AgentName.SENTIMENT_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Contextual trading journal analysis
	 */
	async analyzeWithContext(params: ContextualAnalysisParams): Promise<CognitiveBiasAnalysis> {
		const agent: ContextualSentimentAgent = this.agentFactory.getAgent(
			AgentName.CONTEXTUAL_SENTIMENT_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Trading trend analysis
	 */
	async analyzeTrend(params: TrendAnalysisParams): Promise<TrendAnalysisResponse> {
		const agent: TrendAnalysisAgent = this.agentFactory.getAgent(AgentName.TREND_ANALYSIS);
		return agent.execute(params);
	}

	/**
	 * Trading performance analysis
	 */
	async analyzePerformance(
		params: PerformanceAnalysisParams,
	): Promise<PerformanceAnalysisResponse> {
		const agent: PerformanceAnalysisAgent = this.agentFactory.getAgent(
			AgentName.PERFORMANCE_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Psychological issues analysis
	 */
	async analyzePsychologicalIssues(
		params: PsychologicalIssuesParams,
	): Promise<PsychologicalIssuesResponse> {
		const agent: PsychologicalAnalysisAgent = this.agentFactory.getAgent(
			AgentName.PSYCHOLOGICAL_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Trading psychology plan
	 */
	async createPsychologyPlan(params: PsychologyPlanParams): Promise<PsychologyPlanResponse> {
		const agent: PsychologyPlanAgent = this.agentFactory.getAgent(AgentName.PSYCHOLOGY_PLAN);
		return agent.execute(params);
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
