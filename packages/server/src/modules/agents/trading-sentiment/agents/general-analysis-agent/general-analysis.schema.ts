import z from "zod";
import { coreSentimentSchema } from "../sentiment-analysis-agent/core-sentiment.schema";
import { cognitiveBiasSchema } from "../contextual-sentiment-agent/cognitive-bias.schema";
import { marketTradeSchema } from "../performance-analysis-agent/performance-analysis.schema";
import { strategyRiskSchema } from "../trend-analysis-agent/trend-analysis-response.schema";
import { additionalAnalysisSchema } from "../psychological-issues-agent/psychological-issues.schema";
import { recommendationsSchema } from "../psychology-plan-agent/psychology-plan-response.schema";

// // Combine all schemas into one comprehensive schema
export const generalTradingSchema = z.object({
	...coreSentimentSchema.shape,
	...cognitiveBiasSchema.shape,
	...marketTradeSchema.shape,
	...strategyRiskSchema.shape,
	...additionalAnalysisSchema.shape,
	...recommendationsSchema.shape,
});

export type GeneralTradingAnalysis = z.infer<typeof generalTradingSchema>;
