import { z } from "zod";

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
