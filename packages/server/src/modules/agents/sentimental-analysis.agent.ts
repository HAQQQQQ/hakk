import { z } from "zod";
import { Injectable } from "@nestjs/common";
import { BaseAgent } from "./base.agent";
import { OpenAIClientService } from "../openai/openai-client.service";
import { AgentName } from "./agent.factory";

// Export a type for easy use with z.infer
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisAgent.schema>;

@Injectable()
export class SentimentAnalysisAgent extends BaseAgent<SentimentAnalysis> {
	// Define schema once as a static property
	static readonly schema = z.object({
		text: z.string().describe("The analyzed text content"),
		overallSentiment: z
			.enum(["very negative", "negative", "neutral", "positive", "very positive"])
			.describe("Overall sentiment classification"),
		sentimentScore: z
			.number()
			.min(-1)
			.max(1)
			.describe("Numerical sentiment score from -1 (negative) to 1 (positive)"),
		emotions: z
			.array(
				z.object({
					emotion: z.string().describe("Detected emotion"),
					confidence: z
						.number()
						.min(0)
						.max(1)
						.describe("Confidence score for this emotion"),
				}),
			)
			.describe("Detected emotions with confidence scores"),
		entitySentiments: z
			.array(
				z.object({
					entity: z.string().describe("Named entity or subject"),
					sentiment: z
						.enum(["very negative", "negative", "neutral", "positive", "very positive"])
						.describe("Sentiment toward this entity"),
				}),
			)
			.describe("Sentiment analysis for specific entities mentioned in the text"),
		keyPhrases: z
			.array(z.string())
			.describe("Important phrases that influenced the sentiment analysis"),
	});

	constructor(openaiClient: OpenAIClientService) {
		super(
			openaiClient,
			AgentName.SENTIMENT_ANALYSIS,
			"You are a sentiment analysis expert. Analyze text and extract detailed sentiment information.",
			"analyze_sentiment",
			"You are a helpful assistant that responds by calling the provided function.",
		);
	}

	getSchema() {
		return SentimentAnalysisAgent.schema;
	}

	async execute(text: string): Promise<SentimentAnalysis> {
		return this._execute(text);
	}
}
