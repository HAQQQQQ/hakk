// import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
// import { TranscriptionService } from "./transcription.service";
// import { TradingSentimentAnalysis } from "../agents/trading-sentiment/types/trading-sentiment.types";

// @Controller("transcription")
// export class TranscriptionController {
// 	constructor(private readonly transcriptionService: TranscriptionService) {}

// 	@Post("transcribe")
// 	async transcribe(@Body("logs") logs: string): Promise<TradingSentimentAnalysis> {
// 		//Promise<{ reflection: JournalReflection }> {
// 		console.log("In transcribe endpoint");
// 		console.log("logs are:", logs);
// 		if (!logs?.trim()) {
// 			throw new BadRequestException("Entry text is required");
// 		}
// 		return this.transcriptionService.analyzeTradingJournal(logs);
// 	}
// }

// trading-sentiment.controller.ts
import { Controller, Post, Body, Get, Param, BadRequestException } from "@nestjs/common";
import { TradingSentimentService } from "./trading-sentiment.service";
import {
	TradingSentimentAnalysis,
	TradingContext,
	TradingSessionResults,
	JournalEntryWithMetadata,
} from "./types/trading-sentiment.types";
import { AnalysisConfig, AnalysisType, MultiAnalysisResponse } from "./types/analysis-config.types";

@Controller("trading-psychology")
export class TradingSentimentController {
	constructor(private readonly tradingSentimentService: TradingSentimentService) {}

	/**
	 * Run multiple analyses with a single request using configuration
	 */
	@Post("analyze")
	async analyze(@Body() config: AnalysisConfig): Promise<MultiAnalysisResponse> {
		return this.tradingSentimentService.runAnalyses(config);
	}

	/**
	 * Single agent - Basic sentiment analysis
	 */
	@Post("basic")
	async basicAnalysis(
		@Body("journalEntry") journalEntry: string,
	): Promise<TradingSentimentAnalysis> {
		if (!journalEntry) {
			throw new BadRequestException("Journal entry is required");
		}
		return this.tradingSentimentService.analyzeTradingJournal(journalEntry);
	}

	/**
	 * Single agent - Contextual analysis
	 */
	@Post("contextual")
	async contextualAnalysis(
		@Body("journalEntry") journalEntry: string,
		@Body("context") context: TradingContext,
	) {
		if (!journalEntry || !context) {
			throw new BadRequestException("Journal entry and context are required");
		}
		return this.tradingSentimentService.analyzeWithContext(journalEntry, context);
	}

	/**
	 * Single agent - Trend analysis
	 */
	@Post("trend")
	async trendAnalysis(@Body("journalEntries") journalEntries: JournalEntryWithMetadata[]) {
		if (!journalEntries || !journalEntries.length) {
			throw new BadRequestException("Journal entries are required");
		}
		return this.tradingSentimentService.analyzeTrend(journalEntries);
	}

	/**
	 * Single agent - Performance analysis
	 */
	@Post("performance")
	async performanceAnalysis(
		@Body("journalEntry") journalEntry: string,
		@Body("results") results: TradingSessionResults,
	) {
		if (!journalEntry || !results) {
			throw new BadRequestException("Journal entry and results are required");
		}
		return this.tradingSentimentService.analyzeWithResults(journalEntry, results);
	}

	/**
	 * Single agent - Psychological issues analysis
	 */
	@Post("issues")
	async issuesAnalysis(@Body("journalEntry") journalEntry: string) {
		if (!journalEntry) {
			throw new BadRequestException("Journal entry is required");
		}
		return this.tradingSentimentService.identifyPsychologicalIssues(journalEntry);
	}

	/**
	 * Single agent - Psychology plan
	 */
	@Post("plan")
	async psychologyPlan(@Body("recentEntries") recentEntries: string[]) {
		if (!recentEntries || !recentEntries.length) {
			throw new BadRequestException("Recent entries are required");
		}
		return this.tradingSentimentService.createTradingPsychologyPlan(recentEntries);
	}
}
