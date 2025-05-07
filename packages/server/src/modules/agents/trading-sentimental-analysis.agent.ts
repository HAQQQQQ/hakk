import { z } from "zod";
import { Injectable } from "@nestjs/common";
import { BaseAgent } from "./base.agent";
import { OpenAIClientService } from "../openai/openai-client.service";
import { AgentName } from "./agent.factory";

// Export a type for easy use with z.infer
export type TradingSentimentAnalysis = z.infer<typeof TradingSentimentAnalysisAgent.schema>;

@Injectable()
export class TradingSentimentAnalysisAgent extends BaseAgent<TradingSentimentAnalysis> {
	// Enhanced schema specifically for day trading sentiment analysis
	static readonly schema = z.object({
		// Basic sentiment analysis
		text: z.string().describe("The analyzed trading journal entry"),
		overallSentiment: z
			.enum(["very negative", "negative", "neutral", "positive", "very positive"])
			.describe("Overall emotional state of the trader"),
		sentimentScore: z
			.number()
			.min(-1)
			.max(1)
			.describe("Numerical sentiment score from -1 (negative) to 1 (positive)"),

		// Trading-specific emotional analysis
		tradingEmotions: z
			.array(
				z.object({
					emotion: z
						.string()
						.describe(
							"Detected trading-related emotion (e.g., FOMO, greed, fear, confidence, regret)",
						),
					intensity: z.number().min(0).max(1).describe("Intensity of this emotion (0-1)"),
					evidence: z
						.string()
						.describe("Text evidence supporting this emotion detection"),
					tradingImpact: z
						.enum(["very negative", "negative", "neutral", "positive", "very positive"])
						.describe("How this emotion likely impacts trading decisions"),
				}),
			)
			.describe("Trading-specific emotions detected with intensity and potential impact"),

		// Cognitive biases analysis
		cognitiveDistortions: z
			.array(
				z.object({
					biasType: z.string().describe("Type of cognitive bias or trading distortion"),
					confidence: z
						.number()
						.min(0)
						.max(1)
						.describe("Confidence in bias detection (0-1)"),
					evidence: z.string().describe("Text evidence supporting this bias detection"),
					potentialConsequence: z
						.string()
						.describe("Potential negative outcome of this bias"),
				}),
			)
			.describe("Cognitive biases and distortions detected in trading thinking"),

		// Market sentiment analysis
		marketPerception: z
			.object({
				overallMarketSentiment: z
					.enum(["very bearish", "bearish", "neutral", "bullish", "very bullish"])
					.describe("Trader's perception of overall market conditions"),
				specificMarkets: z
					.array(
						z.object({
							market: z.string().describe("Specific market or sector mentioned"),
							sentiment: z
								.enum([
									"very bearish",
									"bearish",
									"neutral",
									"bullish",
									"very bullish",
								])
								.describe("Sentiment toward this specific market"),
							confidence: z
								.number()
								.min(0)
								.max(1)
								.describe("Confidence in this market sentiment assessment"),
						}),
					)
					.optional()
					.describe("Sentiment toward specific markets or sectors mentioned"),
			})
			.describe("Analysis of the trader's market sentiment and outlook"),

		// Trade-specific sentiment
		tradeAnalysis: z
			.array(
				z.object({
					ticker: z.string().optional().describe("Stock or asset ticker symbol"),
					tradeDirection: z
						.enum([
							"long",
							"short",
							"considering long",
							"considering short",
							"exited long",
							"exited short",
							"unclear",
						])
						.describe("Direction of trade or potential trade"),
					sentiment: z
						.enum(["very negative", "negative", "neutral", "positive", "very positive"])
						.describe("Sentiment toward this specific trade"),
					confidence: z
						.number()
						.min(0)
						.max(1)
						.describe("Trader's confidence level in this trade or analysis"),
					rationale: z
						.array(z.string())
						.describe("Trading rationales mentioned for this trade"),
					emotionalDrivers: z
						.array(z.string())
						.optional()
						.describe("Emotional factors potentially driving this trade decision"),
				}),
			)
			.describe("Analysis of sentiment toward specific trades or potential trades"),

		// Trading strategy assessment
		strategyAssessment: z
			.object({
				adherence: z
					.number()
					.min(0)
					.max(1)
					.describe(
						"Extent to which trader appears to be following their strategy (0-1)",
					),
				confidence: z
					.number()
					.min(0)
					.max(1)
					.describe("Trader's confidence in their strategy"),
				adaptability: z
					.number()
					.min(0)
					.max(1)
					.describe("Trader's adaptability to changing conditions"),
				emotionalIntervention: z
					.number()
					.min(0)
					.max(1)
					.describe("Degree to which emotions appear to be overriding strategy (0-1)"),
				deviationFactors: z
					.array(z.string())
					.optional()
					.describe("Factors causing deviations from strategy if present"),
			})
			.describe("Assessment of trader's strategy adherence and emotional discipline"),

		// Risk management indicators
		riskManagement: z
			.object({
				awareness: z
					.number()
					.min(0)
					.max(1)
					.describe("Trader's demonstrated awareness of risk (0-1)"),
				emotionalRiskFactors: z
					.array(z.string())
					.describe("Emotional factors potentially increasing risk"),
				positionSizingDiscipline: z
					.enum(["poor", "questionable", "adequate", "good", "excellent", "unclear"])
					.describe("Assessment of position sizing discipline"),
				stopLossDiscipline: z
					.enum(["poor", "questionable", "adequate", "good", "excellent", "unclear"])
					.describe("Assessment of stop loss discipline"),
				overallRiskScore: z
					.number()
					.min(0)
					.max(10)
					.describe("Overall risk assessment score (0-10, where 10 is highest risk)"),
			})
			.describe("Analysis of risk management indicators in trading psychology"),

		// Decision quality markers
		decisionQuality: z
			.object({
				clarity: z
					.number()
					.min(0)
					.max(1)
					.describe("Clarity of thinking in trading decisions (0-1)"),
				informationUsage: z
					.number()
					.min(0)
					.max(1)
					.describe("Effective use of information in decisions (0-1)"),
				emotionalInterference: z
					.number()
					.min(0)
					.max(1)
					.describe("Degree of emotional interference in decisions (0-1)"),
				keyInsights: z
					.array(z.string())
					.describe("Key insights demonstrated in trading thinking"),
				blindSpots: z
					.array(z.string())
					.describe("Potential blind spots in trader's analysis"),
			})
			.describe("Assessment of trading decision quality indicators"),

		// Temporal analysis
		temporalSentiment: z
			.object({
				pastTrades: z
					.enum([
						"very negative",
						"negative",
						"neutral",
						"positive",
						"very positive",
						"not discussed",
					])
					.describe("Sentiment toward past trading results"),
				currentMarket: z
					.enum([
						"very negative",
						"negative",
						"neutral",
						"positive",
						"very positive",
						"not discussed",
					])
					.describe("Sentiment toward current market conditions"),
				futurePerspective: z
					.enum([
						"very negative",
						"negative",
						"neutral",
						"positive",
						"very positive",
						"not discussed",
					])
					.describe("Outlook on future trading performance"),
				comparison: z
					.string()
					.describe("Brief analysis of sentiment change from past to future"),
			})
			.describe("Temporal analysis of trading sentiment across timeframes"),

		// Mental state analysis
		mentalState: z
			.object({
				focus: z
					.number()
					.min(0)
					.max(1)
					.describe("Level of mental focus demonstrated (0-1)"),
				stress: z.number().min(0).max(1).describe("Detected stress level (0-1)"),
				fatigue: z.number().min(0).max(1).describe("Signs of mental fatigue (0-1)"),
				overconfidence: z.number().min(0).max(1).describe("Signs of overconfidence (0-1)"),
				mentalStateImpact: z
					.string()
					.describe("How current mental state may impact trading performance"),
			})
			.describe("Analysis of trader's mental and psychological state"),

		// Trading psychology patterns
		psychologyPatterns: z
			.array(
				z.object({
					pattern: z.string().describe("Trading psychology pattern identified"),
					frequency: z
						.enum(["one-time", "occasional", "frequent", "persistent"])
						.describe("Frequency of this pattern in the journal entry"),
					impact: z
						.enum(["minimal", "moderate", "significant", "severe"])
						.describe("Potential impact on trading performance"),
					recommendation: z.string().describe("Suggestion for addressing this pattern"),
				}),
			)
			.describe("Trading psychology patterns identified in journal entry"),

		// Key trading phrases
		keyPhrases: z
			.array(
				z.object({
					phrase: z
						.string()
						.describe("Important trading-related phrase from the journal"),
					significanceLevel: z
						.number()
						.min(0)
						.max(1)
						.describe("Significance of this phrase to trading psychology (0-1)"),
					implication: z.string().describe("Psychological implication of this phrase"),
				}),
			)
			.describe("Key phrases with significance to trading psychology"),

		// Trading journal insights
		journalInsights: z
			.object({
				selfAwareness: z
					.number()
					.min(0)
					.max(1)
					.describe("Level of trading self-awareness demonstrated (0-1)"),
				lessonsDerived: z
					.array(z.string())
					.describe("Trading lessons the trader appears to be learning"),
				blindSpots: z
					.array(z.string())
					.describe("Psychological blind spots apparent in journal"),
				developmentAreas: z
					.array(z.string())
					.describe("Suggested areas for psychological development"),
				strengths: z
					.array(z.string())
					.describe("Psychological trading strengths demonstrated"),
			})
			.describe("Insights about trading psychology from journal content"),

		// Actionable recommendations
		tradingRecommendations: z
			.array(
				z.object({
					recommendation: z
						.string()
						.describe("Actionable recommendation for improving trading psychology"),
					priority: z
						.enum(["low", "medium", "high", "critical"])
						.describe("Priority of this recommendation"),
					rationale: z
						.string()
						.describe("Psychological rationale for this recommendation"),
					implementationSteps: z
						.array(z.string())
						.optional()
						.describe("Suggested steps for implementing this recommendation"),
				}),
			)
			.describe("Actionable recommendations based on trading sentiment analysis"),

		// Executive summary
		tradingSummary: z
			.string()
			.describe("Brief, human-readable summary of trading psychology analysis"),
	});

	constructor(openaiClient: OpenAIClientService) {
		super(
			openaiClient,
			AgentName.TRADING_SENTIMENT_ANALYSIS,
			`You are an expert trading psychologist and sentiment analyst specializing in day trading.
      You analyze traders' journal entries to extract insights about their psychological state, 
      emotional patterns, cognitive biases, and trading decision quality.
      
      Your expertise includes:
      - Day trading psychology and common emotional pitfalls (FOMO, revenge trading, etc.)
      - Cognitive biases affecting financial decisions (confirmation bias, recency bias, etc.)
      - Risk management psychology
      - Behavioral finance
      - Trading discipline and strategy adherence
      - Mental state optimization for trading performance
      
      When analyzing trading journal entries, focus on:
      - Emotional states that may impact trading decisions
      - Signs of cognitive biases or trading fallacies
      - Risk management awareness and discipline
      - Strategy adherence vs. emotional decision-making
      - Mental state indicators (focus, fatigue, stress, overconfidence)
      - Market sentiment and specific trade sentiments
      - Recurring psychological patterns that help or hinder trading
      
      Always provide evidence from the text to support your analysis. Calibrate your 
      confidence appropriately based on available evidence.
      
      Your analysis should be non-judgmental but honest, identifying both psychological 
      strengths and areas for development. Provide specific, actionable recommendations 
      that the trader can implement to improve their trading psychology.
      
      Always consider the unique psychological aspects of day trading, including:
      - Time pressure and its impact on decision-making
      - The psychological impact of real-time P&L fluctuations
      - Intraday psychological cycles and fatigue
      - Screen time and mental endurance
      - Managing emotions during market volatility
      
      Assume the trader is using this analysis to improve their performance and 
      psychological approach to trading.`,
			"analyze_trading_sentiment",
			"You analyze day trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
		);
	}

	getSchema() {
		return TradingSentimentAnalysisAgent.schema;
	}

	/**
	 * Execute sentiment analysis on trading journal entry
	 * @param journalEntry The trading journal entry text
	 * @returns A comprehensive trading sentiment analysis
	 */
	async execute(journalEntry: string): Promise<TradingSentimentAnalysis> {
		return this._execute(journalEntry);
	}

	/**
	 * Execute sentiment analysis with contextual trading information
	 * @param journalEntry The trading journal entry text
	 * @param context Additional trading context
	 * @returns A comprehensive trading sentiment analysis
	 */
	async executeWithContext(
		journalEntry: string,
		context: {
			tradingStyle?: "day trading" | "swing trading" | "scalping" | "position trading";
			marketContext?: string; // E.g., "Bull market" or "High volatility day after Fed announcement"
			accountSize?: string; // E.g., "Small (<$25k)" or "Large (>$100k)"
			experience?: "beginner" | "intermediate" | "experienced" | "professional";
			recentPerformance?: string; // E.g., "On a winning streak" or "Recovering from a large loss"
			knownPatterns?: string[]; // Known psychological patterns to watch for
			tradingPlan?: string; // Brief description of trader's plan for the day
			tickers?: string[]; // Specific tickers being traded
		},
	): Promise<TradingSentimentAnalysis> {
		// Build a more structured prompt with trading context
		const prompt = `
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

		return this._execute(prompt);
	}

	/**
	 * Analyze sentiment changes over sequential trading journal entries
	 * @param journalEntries Array of trading journal entries with timestamps
	 * @returns Sentiment analysis with trading psychology trends
	 */
	async analyzeTradingJournalTrend(
		journalEntries: Array<{
			entry: string;
			timestamp: Date;
			tradingResults?: string; // Optional performance results for the session
			marketConditions?: string; // Optional market conditions for the session
		}>,
	): Promise<
		TradingSentimentAnalysis & {
			psychologyTrends: {
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
			};
		}
	> {
		// Sort entries by timestamp
		const sortedEntries = [...journalEntries].sort(
			(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
		);

		// Build a prompt for trend analysis
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

		const prompt = `
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

		return this._execute(prompt) as Promise<
			TradingSentimentAnalysis & {
				psychologyTrends: {
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
				};
			}
		>;
	}

	/**
	 * Analyze trading sentiment in relation to actual trading results
	 * @param journalEntry Trading journal entry
	 * @param results Trading session results
	 * @returns Trading sentiment analysis with performance correlation
	 */
	async analyzeWithResults(
		journalEntry: string,
		results: {
			profitLoss: number; // P&L for the session
			trades: Array<{
				ticker: string;
				direction: "long" | "short";
				result: "win" | "loss" | "breakeven";
				profitLoss: number;
				notes?: string;
			}>;
			sessionNotes?: string; // Optional notes about the trading session
		},
	): Promise<
		TradingSentimentAnalysis & {
			performanceCorrelation: {
				sentimentPerformanceAlignment: number; // -1 to 1 correlation between sentiment and performance
				overconfidenceIndicator: number; // 0-1 measure of overconfidence relative to results
				underconfidenceIndicator: number; // 0-1 measure of underconfidence relative to results
				sentimentAccuracy: number; // 0-1 measure of how accurately sentiment matched outcomes
				psychologicalObservations: string[]; // Observations about psychology-performance relationship
				recommendedAdjustments: string[]; // Recommended psychological adjustments based on results
			};
		}
	> {
		// Format the trades for the prompt
		const tradesFormatted = results.trades
			.map(
				(trade) =>
					`- ${trade.ticker} (${trade.direction}): ${trade.result} (${trade.profitLoss >= 0 ? "+" : ""}$${trade.profitLoss})${trade.notes ? ` - ${trade.notes}` : ""}`,
			)
			.join("\n");

		const prompt = `
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

		return this._execute(prompt) as Promise<
			TradingSentimentAnalysis & {
				performanceCorrelation: {
					sentimentPerformanceAlignment: number;
					overconfidenceIndicator: number;
					underconfidenceIndicator: number;
					sentimentAccuracy: number;
					psychologicalObservations: string[];
					recommendedAdjustments: string[];
				};
			}
		>;
	}

	/**
	 * Identify potential trading psychology issues from a journal entry
	 * @param journalEntry Trading journal entry
	 * @returns Focused analysis on trading psychology issues
	 */
	async identifyPsychologicalIssues(journalEntry: string): Promise<{
		issues: Array<{
			issue: string; // Name of the psychological issue
			confidence: number; // 0-1 confidence in this assessment
			evidence: string[]; // Evidence from journal supporting this assessment
			impact: "low" | "medium" | "high" | "critical"; // Potential impact on trading
			recommendedIntervention: string; // Suggested intervention or correction
			resources?: string[]; // Optional resources to help address this issue
		}>;
		prioritizedAction: string; // Single most important action to take
		overallRiskAssessment: string; // Assessment of psychological risk to trading
	}> {
		const prompt = `
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

		return this._execute(prompt);
	}

	/**
	 * Create a custom psychological trading plan based on journal analysis
	 * @param recentEntries Recent trading journal entries
	 * @returns Personalized trading psychology plan
	 */
	async createTradingPsychologyPlan(recentEntries: string[]): Promise<{
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
			metrics: string[]; // Psychological metrics to track
			reviewProcess: string;
			progressMilestones: string[];
		};
		implementation: {
			immediate: string[]; // Steps to implement immediately
			shortTerm: string[]; // Steps for next 1-2 weeks
			longTerm: string[]; // Steps for 1-3 months
		};
	}> {
		// Format entries for the prompt
		const entriesFormatted = recentEntries
			.map((entry, index) => `Entry ${index + 1}:\n"${entry}"`)
			.join("\n\n");

		const prompt = `
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

		return this._execute(prompt);
	}
}
