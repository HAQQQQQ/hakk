import { Agent, AgentBuilder, AgentResponse } from "../agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus, LoggingMiddleware, Message } from "../core";

import { z } from "zod";
import { AgentImpl } from "./agent-impl";
import { JournalEntryWithMetadata } from "./interfaces";

export const strategyRiskSchema = z.object({
	// Trading strategy assessment
	strategyAssessment: z
		.object({
			adherence: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Extent to which trader appears to be following their strategy (0-1)"),
			// confidence: z.number().min(0).max(1).describe("Trader's confidence in their strategy (0-1)"),
			confidence: z.number().describe("Trader's confidence in their strategy (0-1)"),
			adaptability: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Trader's adaptability to changing conditions (0-1)"),
			emotionalIntervention: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Degree to which emotions appear to be overriding strategy (0-1)"),
			deviationFactors: z
				.array(z.string())
				// .optional()
				.nullable()
				.describe("Factors causing deviations from strategy if present"),
		})
		.describe("Assessment of trader's strategy adherence and emotional discipline"),

	// Risk management indicators
	riskManagement: z
		.object({
			awareness: z
				.number()
				// .min(0)
				// .max(1)
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
				// .min(0)
				// .max(10)
				.describe("Overall risk assessment score (0-10, where 10 is highest risk)"),
		})
		.describe("Analysis of risk management indicators in trading psychology"),

	// Decision quality markers
	decisionQuality: z
		.object({
			clarity: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Clarity of thinking in trading decisions (0-1)"),
			informationUsage: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Effective use of information in decisions (0-1)"),
			emotionalInterference: z
				.number()
				// .min(0)
				// .max(1)
				.describe("Degree of emotional interference in decisions (0-1)"),
			keyInsights: z
				.array(z.string())
				.describe("Key insights demonstrated in trading thinking"),
			blindSpots: z.array(z.string()).describe("Potential blind spots in trader's analysis"),
		})
		.describe("Assessment of trading decision quality indicators"),
});

export const tradingPsychologyTrendsSchema = z.object({
	emotionalTrend: z
		.enum(["improving", "deteriorating", "stable", "fluctuating"])
		.describe("Trend in emotional state over time"),
	tradingDiscipline: z
		.enum(["improving", "deteriorating", "stable", "fluctuating"])
		.describe("Trend in trading discipline over time"),
	riskManagement: z
		.enum(["improving", "deteriorating", "stable", "fluctuating"])
		.describe("Trend in risk management over time"),
	decisionQuality: z
		.enum(["improving", "deteriorating", "stable", "fluctuating"])
		.describe("Trend in decision-making quality over time"),
	significantChanges: z
		.array(
			z.object({
				fromTimestamp: z.date().describe("Start timestamp of the change"),
				toTimestamp: z.date().describe("End timestamp of the change"),
				change: z.string().describe("Description of the significant change"),
				likelyTriggers: z
					.array(z.string())
					.describe("List of likely triggers for the change"),
				recommendedIntervention: z
					.string()
					.describe("Recommended intervention for the change"),
			}),
		)
		.describe("List of significant psychological changes over time"),
	habitFormation: z
		.object({
			positiveHabits: z.array(z.string()).describe("List of positive habits formed"),
			negativeHabits: z.array(z.string()).describe("List of negative habits formed"),
			interventionPriorities: z
				.array(z.string())
				.describe("List of prioritized interventions for habits"),
		})
		.describe("Details about habit formation and intervention priorities"),
});

export const trendAnalysisResponseSchema = z.object({
	...tradingPsychologyTrendsSchema.shape,
	...strategyRiskSchema.shape,
});

export type TrendAnalysisResponse = z.infer<typeof trendAnalysisResponseSchema>;

export const trendAnalysisPromptTemplate = (journalEntries: JournalEntryWithMetadata[]): string => {
	const sortedEntries = [...journalEntries].sort(
		(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
	);

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

	return `
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
};

const SYSTEM_PROMPT =
	"You analyze trends across multiple trading journal entries to identify psychological patterns over time.";

export class TrendAnalysisAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new trend analysis agent
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("TrendAnalysisAgent")
			.withDescription(
				"Analyzes trends across multiple trading journal entries to identify psychological patterns over time",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Analyze trends across multiple journal entries
	 *
	 * @param journalEntries - Array of journal entries with metadata
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Trend analysis or null if processing failed
	 */
	async analyzeTrends(
		journalEntries: JournalEntryWithMetadata[],
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<AgentResponse<TrendAnalysisResponse> | null> {
		// Generate the prompt from the template
		const prompt = trendAnalysisPromptTemplate(journalEntries);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<TrendAnalysisResponse>(
				prompt,
				trendAnalysisResponseSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error analyzing trends:", error);
			return null;
		}
	}
}
