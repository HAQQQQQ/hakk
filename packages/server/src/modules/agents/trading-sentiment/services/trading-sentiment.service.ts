// trading-sentiment.service.ts
import { Injectable } from "@nestjs/common";
import { SentimentAnalysisAgent } from "../agents/sentiment-analysis-agent/trading-sentiment-analysis.agent";
import { ContextualSentimentAgent } from "../agents/contextual-sentiment-agent/contextual-sentiment-analysis.agent";
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
import { AgentResponse } from "../../base.agent";

@Injectable()
export class TradingSentimentService {
	constructor(private readonly agentFactory: AgentFactory) {}

	/**
	 * General high level analysis of everything
	 */
	async generalAnalysis(
		params: JournalEntryParams,
	): Promise<AgentResponse<GeneralTradingAnalysis>> {
		const agent: GeneralAnalysisAgent = this.agentFactory.getAgent(
			AgentName.GENERAL_TRADING_ANALYSIS_AGENT,
		);
		return agent.execute(params);
	}

	/**
	 * Basic trading journal sentiment analysis
	 */
	async analyzeSentiment(
		params: JournalEntryParams,
	): Promise<AgentResponse<CoreSentimentAnalysis>> {
		const agent: SentimentAnalysisAgent = this.agentFactory.getAgent(
			AgentName.SENTIMENT_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Contextual trading journal analysis
	 */
	async analyzeWithContext(
		params: ContextualAnalysisParams,
	): Promise<AgentResponse<CognitiveBiasAnalysis>> {
		const agent: ContextualSentimentAgent = this.agentFactory.getAgent(
			AgentName.CONTEXTUAL_SENTIMENT_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Trading trend analysis
	 */
	async analyzeTrend(params: TrendAnalysisParams): Promise<AgentResponse<TrendAnalysisResponse>> {
		const agent = this.agentFactory.getAgent(AgentName.TREND_ANALYSIS);
		return agent.execute(params);
	}

	/**
	 * Trading performance analysis
	 */
	async analyzePerformance(
		params: PerformanceAnalysisParams,
	): Promise<AgentResponse<PerformanceAnalysisResponse>> {
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
	): Promise<AgentResponse<PsychologicalIssuesResponse>> {
		const agent: PsychologicalAnalysisAgent = this.agentFactory.getAgent(
			AgentName.PSYCHOLOGICAL_ANALYSIS,
		);
		return agent.execute(params);
	}

	/**
	 * Trading psychology plan
	 */
	async createPsychologyPlan(
		params: PsychologyPlanParams,
	): Promise<AgentResponse<PsychologyPlanResponse>> {
		const agent: PsychologyPlanAgent = this.agentFactory.getAgent(AgentName.PSYCHOLOGY_PLAN);
		return agent.execute(params);
	}
}
