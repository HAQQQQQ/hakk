import { z } from "zod";
import { Injectable } from "@nestjs/common";
import { BaseAgent } from "../base.agent";
import { OpenAIClientService } from "../../openai/openai-client.service";
import { AgentName } from "../agent.factory";
import { tradingSentimentSchema } from "./schema";
import {
	TradingSentimentAnalysis,
	TradingSentimentTrendAnalysis,
	TradingSentimentPerformanceAnalysis,
	PsychologicalIssuesAnalysis,
	TradingPsychologyPlan,
	TradingContext,
} from "./types/trading-sentiment.types";
import { TradingPromptBuilderService } from "./services/prompt-builder.service";

@Injectable()
export class TradingSentimentAnalysisAgent extends BaseAgent<TradingSentimentAnalysis> {
	constructor(
		openaiClient: OpenAIClientService,
		private readonly promptBuilder: TradingPromptBuilderService,
	) {
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
		return tradingSentimentSchema;
	}

	/**
	 * Execute sentiment analysis on trading journal entry
	 * @param journalEntry The trading journal entry text
	 * @returns A comprehensive trading sentiment analysis
	 */
	async execute(journalEntry: string): Promise<TradingSentimentAnalysis> {
		const prompt = this.promptBuilder.buildBasePrompt(journalEntry);
		return this._execute(prompt);
	}

	/**
	 * Execute sentiment analysis with contextual trading information
	 * @param journalEntry The trading journal entry text
	 * @param context Additional trading context
	 * @returns A comprehensive trading sentiment analysis
	 */
	async executeWithContext(
		journalEntry: string,
		context: TradingContext,
	): Promise<TradingSentimentAnalysis> {
		const prompt = this.promptBuilder.buildContextualPrompt(journalEntry, context);
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
			tradingResults?: string;
			marketConditions?: string;
		}>,
	): Promise<TradingSentimentTrendAnalysis> {
		const prompt = this.promptBuilder.buildTrendAnalysisPrompt(journalEntries);
		return this._execute(prompt) as Promise<TradingSentimentTrendAnalysis>;
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
	): Promise<TradingSentimentPerformanceAnalysis> {
		const prompt = this.promptBuilder.buildResultsAnalysisPrompt(journalEntry, results);
		return this._execute(prompt) as Promise<TradingSentimentPerformanceAnalysis>;
	}

	/**
	 * Identify potential trading psychology issues from a journal entry
	 * @param journalEntry Trading journal entry
	 * @returns Focused analysis on trading psychology issues
	 */
	async identifyPsychologicalIssues(journalEntry: string): Promise<PsychologicalIssuesAnalysis> {
		const prompt = this.promptBuilder.buildIssuesPrompt(journalEntry);
		return this._execute(prompt);
	}

	/**
	 * Create a custom psychological trading plan based on journal analysis
	 * @param recentEntries Recent trading journal entries
	 * @returns Personalized trading psychology plan
	 */
	async createTradingPsychologyPlan(recentEntries: string[]): Promise<TradingPsychologyPlan> {
		const prompt = this.promptBuilder.buildPsychologyPlanPrompt(recentEntries);
		return this._execute(prompt);
	}
}
