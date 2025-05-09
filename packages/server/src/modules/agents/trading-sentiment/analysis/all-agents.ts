// 1. trading-sentiment-analysis.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { TradingSentimentAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { JournalEntryParams } from "./agent-params.types";
import { AgentName } from "../../agent.factory";
import { BasePromptBuilder } from "../prompts/builders/base-prompt.builder";

@Injectable()
export class TradingSentimentAnalysisAgent extends BaseTradingSentimentAgent<
	JournalEntryParams,
	TradingSentimentAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: BasePromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_ANALYSIS,
			"trading_sentiment_analysis",
			"You analyze trading journal entries to extract detailed psychological insights, emotions, cognitive biases, and actionable recommendations to improve trading performance.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}

// 2. contextual-sentiment.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { ContextualAnalysisParams } from "./agent-params.types";
import { TradingSentimentAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { ContextualPromptBuilder } from "../prompts/builders/contextual-prompt.builder";

@Injectable()
export class ContextualTradingSentimentAgent extends BaseTradingSentimentAgent<
	ContextualAnalysisParams,
	TradingSentimentAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: ContextualPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_CONTEXTUAL,
			"trading_sentiment_contextual",
			"You analyze day trading journal entries with additional context to extract detailed psychological insights.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}

// 3. trend-analysis.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { TrendAnalysisParams } from "./agent-params.types";
import { TradingSentimentTrendAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { AgentName } from "../../agent.factory";
import { TrendAnalysisPromptBuilder } from "../prompts/builders/trend-analysis-prompt.builder";

@Injectable()
export class TradingSentimentTrendAgent extends BaseTradingSentimentAgent<
	TrendAnalysisParams,
	TradingSentimentTrendAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: TrendAnalysisPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_TREND,
			"trading_sentiment_trend",
			"You analyze trends across multiple trading journal entries to identify psychological patterns over time.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}

// 4. performance-analysis.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { TradingSentimentPerformanceAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { PerformanceAnalysisParams } from "./agent-params.types";
import { AgentName } from "../../agent.factory";
import { ResultsAnalysisPromptBuilder } from "../prompts/builders/results-analysis-prompt.builder";

@Injectable()
export class TradingSentimentPerformanceAgent extends BaseTradingSentimentAgent<
	PerformanceAnalysisParams,
	TradingSentimentPerformanceAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: ResultsAnalysisPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_SENTIMENT_PERFORMANCE,
			"trading_sentiment_performance",
			"You analyze trading journal entries in relation to actual performance to identify correlation between psychology and results.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}

// 5. psychological-issues.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { PsychologicalIssuesAnalysis } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { PsychologicalIssuesParams } from "./agent-params.types";
import { AgentName } from "../../agent.factory";
import { IssuesPromptBuilder } from "../prompts/builders/issues-prompt.builder";

@Injectable()
export class PsychologicalIssuesAgent extends BaseTradingSentimentAgent<
	PsychologicalIssuesParams,
	PsychologicalIssuesAnalysis
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: IssuesPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_PSYCHOLOGICAL_ISSUES,
			"psychological_issues_analysis",
			"You identify and prioritize potential psychological issues affecting a trader based on their journal entries.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}

// 6. psychology-plan.agent.ts
import { Injectable } from "@nestjs/common";
import { BaseTradingSentimentAgent } from "../trading-sentimental-analysis.agent";
import { TradingPsychologyPlan } from "../types/trading-sentiment.types";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { PsychologyPlanParams } from "./agent-params.types";
import { AgentName } from "../../agent.factory";
import { PsychologyPlanPromptBuilder } from "../prompts/builders/psychology-plan-prompt.builder";

@Injectable()
export class TradingPsychologyPlanAgent extends BaseTradingSentimentAgent<
	PsychologyPlanParams,
	TradingPsychologyPlan
> {
	constructor(openaiClient: OpenAIClientService, promptBuilder: PsychologyPlanPromptBuilder) {
		super(
			openaiClient,
			promptBuilder,
			AgentName.TRADING_PSYCHOLOGY_PLAN,
			"trading_psychology_plan",
			"You create a personalized trading psychology plan based on analysis of recent trading journal entries.",
		);
	}

	// No need to implement buildPrompt - it's inherited from BaseAgent
}
