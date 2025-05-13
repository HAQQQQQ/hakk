import { z } from "zod";
import { Agent, AgentBuilder } from "../agent";
import { OpenAIClientService } from "@/modules/openai/openai-client.service";
import { EventBus, LoggingMiddleware, Message } from "../core";
import { AgentImpl } from "./agent-impl";

export const recommendationsSchema = z.object({
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
				rationale: z.string().describe("Psychological rationale for this recommendation"),
				implementationSteps: z
					.array(z.string())
					// .optional()
					.nullable()
					.describe("Suggested steps for implementing this recommendation"),
			}),
		)
		.describe("Actionable recommendations based on trading sentiment analysis"),

	// Executive summary
	tradingSummary: z
		.string()
		.describe("Brief, human-readable summary of trading psychology analysis"),
});

export const tradingPsychologyPlanSchema = z.object({
	psychologicalProfile: z
		.object({
			strengths: z
				.array(z.string())
				.describe("List of psychological strengths identified in the trader"),
			vulnerabilities: z
				.array(z.string())
				.describe("List of psychological vulnerabilities identified in the trader"),
			emotionalTriggers: z
				.array(z.string())
				.describe("List of emotional triggers affecting trading performance"),
			cognitivePatterns: z
				.array(z.string())
				.describe("List of cognitive patterns observed in the trader"),
		})
		.describe("Psychological profile of the trader"),
	plan: z
		.object({
			dailyPractices: z
				.array(z.string())
				.describe("Daily practices to improve trading psychology"),
			tradingSessionStructure: z
				.string()
				.describe("Recommended structure for trading sessions"),
			triggerManagementStrategies: z
				.array(
					z.object({
						trigger: z.string().describe("Specific emotional or cognitive trigger"),
						interventionStrategy: z
							.string()
							.describe("Strategy to manage the identified trigger"),
					}),
				)
				.describe("Strategies to manage emotional or cognitive triggers"),
			metrics: z.array(z.string()).describe("Metrics to track psychological progress"),
			reviewProcess: z.string().describe("Process for reviewing psychological progress"),
			progressMilestones: z
				.array(z.string())
				.describe("Milestones to measure psychological development"),
		})
		.describe("Detailed trading psychology improvement plan"),
	implementation: z
		.object({
			immediate: z.array(z.string()).describe("Immediate actions to implement the plan"),
			shortTerm: z.array(z.string()).describe("Short-term actions to implement the plan"),
			longTerm: z.array(z.string()).describe("Long-term actions to implement the plan"),
		})
		.describe("Implementation steps for the trading psychology plan"),
});

export const psychologyPlanResponseSchema = z.object({
	...tradingPsychologyPlanSchema.shape,
	...recommendationsSchema.shape,
});

export type PsychologyPlanResponse = z.infer<typeof psychologyPlanResponseSchema>;

export const psychologyPlanPromptTemplate = (recentEntries: string[]): string => {
	const entriesFormatted = recentEntries
		.map((entry, index) => `Entry ${index + 1}:\n"${entry}"`)
		.join("\n\n");

	return `
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
};

const SYSTEM_PROMPT =
	"You create a personalized trading psychology plan based on analysis of recent trading journal entries.";

export class PsychologyPlanAgent extends AgentImpl {
	protected agent: Agent;

	/**
	 * Create a new psychology plan agent
	 *
	 * @param openaiClient - OpenAI client service
	 */
	constructor(openaiClient: OpenAIClientService) {
		super();
		// Create the agent using the builder pattern
		this.agent = new AgentBuilder("PsychologyPlanAgent")
			.withDescription(
				"Creates a personalized trading psychology plan based on analysis of recent trading journal entries",
			)
			.withSystemPrompt(SYSTEM_PROMPT)
			.withOpenAIClient(openaiClient)
			.withEventBus(new EventBus())
			.withMiddleware(new LoggingMiddleware())
			.build();
	}

	/**
	 * Create a psychology plan based on recent journal entries
	 *
	 * @param recentEntries - Array of recent trading journal entries
	 * @param onMessage - Optional callback for messages during processing
	 * @returns Psychology plan or null if processing failed
	 */
	async createPsychologyPlan(
		recentEntries: string[],
		onMessage?: (message: Message) => void | Promise<void>,
	): Promise<PsychologyPlanResponse | null> {
		// Generate the prompt from the template
		const prompt = psychologyPlanPromptTemplate(recentEntries);

		// Default message handler if none provided
		const messageHandler = onMessage || this.createDefaultMessageHandler();

		try {
			// Process the query with schema validation
			const result = await this.agent.processQueryWithSchema<PsychologyPlanResponse>(
				prompt,
				psychologyPlanResponseSchema,
				messageHandler,
			);

			return result;
		} catch (error) {
			console.error("Error creating psychology plan:", error);
			return null;
		}
	}
}
