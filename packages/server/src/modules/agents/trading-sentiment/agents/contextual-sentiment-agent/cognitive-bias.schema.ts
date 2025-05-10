import { z } from "zod";

export const cognitiveBiasSchema = z.object({
	// Cognitive biases analysis
	cognitiveDistortions: z
		.array(
			z.object({
				biasType: z.string().describe("Type of cognitive bias or trading distortion"),
				// confidence: z.number().min(0).max(1).describe("Confidence in bias detection (0-1)"),
				confidence: z.number().describe("Confidence in bias detection (0-1)"),
				evidence: z.string().describe("Text evidence supporting this bias detection"),
				potentialConsequence: z
					.string()
					.describe("Potential negative outcome of this bias"),
			}),
		)
		.describe("Cognitive biases and distortions detected in trading thinking"),

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
});

export type CognitiveBiasAnalysis = z.infer<typeof cognitiveBiasSchema>;
