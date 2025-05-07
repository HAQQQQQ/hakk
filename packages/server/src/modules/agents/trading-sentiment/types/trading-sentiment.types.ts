import { z } from "zod";
import { tradingSentimentSchema } from "../schema";

// Base type for all trading sentiment analysis results
export type TradingSentimentAnalysis = z.infer<typeof tradingSentimentSchema>;

// Types for trend analysis results
export interface TradingPsychologyTrends {
	emotionalTrend: "improving" | "deteriorating" | "stable" | "fluctuating";
	tradingDiscipline: "improving" | "deteriorating" | "stable" | "fluctuating";
	riskManagement: "improving" | "deteriorating" | "stable" | "fluctuating";
	decisionQuality: "improving" | "deteriorating" | "stable" | "fluctuating";
	significantChanges: Array<{
		fromTimestamp: Date;
		toTimestamp: Date;
		change: string;
		likelyTriggers: string[];
		recommendedIntervention: string;
	}>;
	habitFormation: {
		positiveHabits: string[];
		negativeHabits: string[];
		interventionPriorities: string[];
	};
}

export type TradingSentimentTrendAnalysis = TradingSentimentAnalysis & {
	psychologyTrends: TradingPsychologyTrends;
};

// Types for performance correlation analysis
export interface PerformanceCorrelation {
	sentimentPerformanceAlignment: number; // -1 to 1 correlation
	overconfidenceIndicator: number; // 0-1 measure
	underconfidenceIndicator: number; // 0-1 measure
	sentimentAccuracy: number; // 0-1 measure
	psychologicalObservations: string[];
	recommendedAdjustments: string[];
}

export type TradingSentimentPerformanceAnalysis = TradingSentimentAnalysis & {
	performanceCorrelation: PerformanceCorrelation;
};

// Types for psychological issues identification
export interface TradingPsychologicalIssue {
	issue: string;
	confidence: number;
	evidence: string[];
	impact: "low" | "medium" | "high" | "critical";
	recommendedIntervention: string;
	resources?: string[];
}

export interface PsychologicalIssuesAnalysis {
	issues: TradingPsychologicalIssue[];
	prioritizedAction: string;
	overallRiskAssessment: string;
}

// Types for trading psychology plan
export interface TradingPsychologyPlan {
	psychologicalProfile: {
		strengths: string[];
		vulnerabilities: string[];
		emotionalTriggers: string[];
		cognitivePatterns: string[];
	};
	plan: {
		dailyPractices: string[];
		tradingSessionStructure: string;
		triggerManagementStrategies: Array<{
			trigger: string;
			interventionStrategy: string;
		}>;
		metrics: string[];
		reviewProcess: string;
		progressMilestones: string[];
	};
	implementation: {
		immediate: string[];
		shortTerm: string[];
		longTerm: string[];
	};
}

// Context type for analysis with additional context
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
