// // types/analysis-config.types.ts
// import {
//     TradingContext,
//     TradingSessionResults,
//     JournalEntryWithMetadata,
//     CoreSentimentAnalysis,
//     TrendAnalysisResponse,
//     PerformanceAnalysisResponse,
//     PsychologicalIssuesResponse,
//     PsychologyPlanResponse
// } from './trading-sentiment.types';

// /**
//  * Enum of available analysis types
//  */
// export enum AnalysisType {
//     SENTIMENT = 'sentiment',
//     CONTEXTUAL = 'contextual',
//     TREND = 'trend',
//     PERFORMANCE = 'performance',
//     PSYCHOLOGICAL_ISSUES = 'psychologicalIssues',
//     PSYCHOLOGY_PLAN = 'psychologyPlan'
// }

// /**
//  * Base configuration for all analysis requests
//  */
// export interface AnalysisConfig {
//     // Required - which analyses to run
//     analysisTypes: AnalysisType[];

//     // Required for most analyses
//     journalEntry?: string;

//     // Optional parameters for specific analyses
//     context?: TradingContext;
//     journalEntries?: JournalEntryWithMetadata[];
//     results?: TradingSessionResults;
//     recentEntries?: string[];
// }

// /**
//  * Response format for multi-analysis
//  */
// export interface MultiAnalysisResponse {
//     sentiment?: CoreSentimentAnalysis;
//     contextual?: CoreSentimentAnalysis;
//     trend?: TrendAnalysisResponse;
//     performance?: PerformanceAnalysisResponse;
//     psychologicalIssues?: PsychologicalIssuesResponse;
//     psychologyPlan?: PsychologyPlanResponse;
//     [key: string]: any; // To allow for accessing by analysis type string
// }
