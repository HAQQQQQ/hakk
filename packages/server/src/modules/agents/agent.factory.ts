// // agent.factory.ts
// import { Injectable, OnModuleInit } from "@nestjs/common";
// import { BaseAgent } from "./base.agent";
// import { TradingSentimentAnalysisAgent } from "../modules/trading-sentiment/agents/trading-sentiment-analysis.agent";
// import { ContextualTradingSentimentAgent } from "../modules/trading-sentiment/agents/contextual-sentiment.agent";
// import { TradingSentimentTrendAgent } from "../modules/trading-sentiment/agents/trend-analysis.agent";
// import { TradingSentimentPerformanceAgent } from "../modules/trading-sentiment/agents/performance-analysis.agent";
// import { PsychologicalIssuesAgent } from "../modules/trading-sentiment/agents/psychological-issues.agent";
// import { TradingPsychologyPlanAgent } from "../modules/trading-sentiment/agents/psychology-plan.agent";

// export enum AgentName {
//     TRADING_SENTIMENT_ANALYSIS = "trading-sentiment-analysis",
//     TRADING_SENTIMENT_CONTEXTUAL = "trading-sentiment-contextual",
//     TRADING_SENTIMENT_TREND = "trading-sentiment-trend",
//     TRADING_SENTIMENT_PERFORMANCE = "trading-sentiment-performance",
//     TRADING_PSYCHOLOGICAL_ISSUES = "trading-psychological-issues",
//     TRADING_PSYCHOLOGY_PLAN = "trading-psychology-plan",
//     // Add more agents here as needed
// }

// /**
//  * Type mapping of agent names to their concrete agent types
//  * This provides type safety when retrieving agents from the factory
//  */
// export interface AgentMap {
//     [AgentName.TRADING_SENTIMENT_ANALYSIS]: TradingSentimentAnalysisAgent;
//     [AgentName.TRADING_SENTIMENT_CONTEXTUAL]: ContextualTradingSentimentAgent;
//     [AgentName.TRADING_SENTIMENT_TREND]: TradingSentimentTrendAgent;
//     [AgentName.TRADING_SENTIMENT_PERFORMANCE]: TradingSentimentPerformanceAgent;
//     [AgentName.TRADING_PSYCHOLOGICAL_ISSUES]: PsychologicalIssuesAgent;
//     [AgentName.TRADING_PSYCHOLOGY_PLAN]: TradingPsychologyPlanAgent;
// }

// /**
//  * Factory for getting LLM agents
//  * Provides a clean interface for external services to get agent instances
//  */
// @Injectable()
// export class AgentFactory implements OnModuleInit {
//     private agents = new Map<AgentName, BaseAgent<any, any>>();

//     constructor(
//         private readonly tradingSentimentAnalysisAgent: TradingSentimentAnalysisAgent,
//         private readonly contextualTradingSentimentAgent: ContextualTradingSentimentAgent,
//         private readonly tradingSentimentTrendAgent: TradingSentimentTrendAgent,
//         private readonly tradingSentimentPerformanceAgent: TradingSentimentPerformanceAgent,
//         private readonly psychologicalIssuesAgent: PsychologicalIssuesAgent,
//         private readonly tradingPsychologyPlanAgent: TradingPsychologyPlanAgent,
//     ) { }

//     /**
//      * Initialize the factory by registering all agents
//      */
//     onModuleInit() {
//         this.registerAgents();
//     }

//     /**
//      * Register all available agents with the factory
//      */
//     private registerAgents() {
//         this.agents.set(AgentName.TRADING_SENTIMENT_ANALYSIS, this.tradingSentimentAnalysisAgent);
//         this.agents.set(AgentName.TRADING_SENTIMENT_CONTEXTUAL, this.contextualTradingSentimentAgent);
//         this.agents.set(AgentName.TRADING_SENTIMENT_TREND, this.tradingSentimentTrendAgent);
//         this.agents.set(AgentName.TRADING_SENTIMENT_PERFORMANCE, this.tradingSentimentPerformanceAgent);
//         this.agents.set(AgentName.TRADING_PSYCHOLOGICAL_ISSUES, this.psychologicalIssuesAgent);
//         this.agents.set(AgentName.TRADING_PSYCHOLOGY_PLAN, this.tradingPsychologyPlanAgent);
//     }

//     /**
//      * Retrieves an agent by its name.
//      * The factory infers the type of the agent based on the AgentName.
//      * @param agentName - The name of the agent to retrieve.
//      * @returns The requested agent instance with the correct type.
//      */
//     get<K extends keyof AgentMap>(agentName: K): AgentMap[K] {
//         const agent = this.agents.get(agentName);
//         if (!agent) {
//             throw new Error(`Agent with name "${agentName}" not found.`);
//         }
//         return agent as AgentMap[K];
//     }

//     /**
//      * Alternative method that returns the complete agent with all its methods
//      * Useful when you need access to the agent's full interface
//      */
//     getAgent<K extends keyof AgentMap>(agentName: K): AgentMap[K] {
//         return this.get(agentName);
//     }

//     /**
//      * Check if an agent exists in the factory
//      * @param agentName - The name of the agent to check
//      * @returns True if the agent exists, false otherwise
//      */
//     hasAgent(agentName: AgentName): boolean {
//         return this.agents.has(agentName);
//     }

//     /**
//      * Get all available agent names
//      * @returns Array of all available agent names
//      */
//     getAvailableAgents(): AgentName[] {
//         return Array.from(this.agents.keys());
//     }
// }

import { Injectable } from "@nestjs/common";
import {
	ContextualTradingSentimentAgent,
	PsychologicalIssuesAgent,
	TradingPsychologyPlanAgent,
	TradingSentimentAnalysisAgent,
	TradingSentimentPerformanceAgent,
	TradingSentimentTrendAgent,
} from "./trading-sentiment/analysis/all-agents";

// agent-name.enum.ts
export enum AgentName {
	TRADING_SENTIMENT_ANALYSIS = "trading-sentiment-analysis",
	TRADING_SENTIMENT_CONTEXTUAL = "trading-sentiment-contextual",
	TRADING_SENTIMENT_TREND = "trading-sentiment-trend",
	TRADING_SENTIMENT_PERFORMANCE = "trading-sentiment-performance",
	TRADING_PSYCHOLOGICAL_ISSUES = "trading-psychological-issues",
	TRADING_PSYCHOLOGY_PLAN = "trading-psychology-plan",
	// Add more agents here as needed
}

type AgentTypeMap = {
	[AgentName.TRADING_SENTIMENT_ANALYSIS]: TradingSentimentAnalysisAgent;
	[AgentName.TRADING_SENTIMENT_CONTEXTUAL]: ContextualTradingSentimentAgent;
	[AgentName.TRADING_SENTIMENT_TREND]: TradingSentimentTrendAgent;
	[AgentName.TRADING_SENTIMENT_PERFORMANCE]: TradingSentimentPerformanceAgent;
	[AgentName.TRADING_PSYCHOLOGICAL_ISSUES]: PsychologicalIssuesAgent;
	[AgentName.TRADING_PSYCHOLOGY_PLAN]: TradingPsychologyPlanAgent;
};

@Injectable()
export class AgentFactory {
	private readonly agents: AgentTypeMap;

	constructor(
		tradingSentimentAnalysisAgent: TradingSentimentAnalysisAgent,
		contextualTradingSentimentAgent: ContextualTradingSentimentAgent,
		tradingSentimentTrendAgent: TradingSentimentTrendAgent,
		tradingSentimentPerformanceAgent: TradingSentimentPerformanceAgent,
		psychologicalIssuesAgent: PsychologicalIssuesAgent,
		tradingPsychologyPlanAgent: TradingPsychologyPlanAgent,
	) {
		this.agents = {
			[AgentName.TRADING_SENTIMENT_ANALYSIS]: tradingSentimentAnalysisAgent,
			[AgentName.TRADING_SENTIMENT_CONTEXTUAL]: contextualTradingSentimentAgent,
			[AgentName.TRADING_SENTIMENT_TREND]: tradingSentimentTrendAgent,
			[AgentName.TRADING_SENTIMENT_PERFORMANCE]: tradingSentimentPerformanceAgent,
			[AgentName.TRADING_PSYCHOLOGICAL_ISSUES]: psychologicalIssuesAgent,
			[AgentName.TRADING_PSYCHOLOGY_PLAN]: tradingPsychologyPlanAgent,
		};
	}

	getAgent<K extends AgentName>(agentName: K): AgentTypeMap[K] {
		const agent = this.agents[agentName];
		if (!agent) {
			throw new Error(`Agent ${agentName} not found`);
		}
		return agent;
	}
}
