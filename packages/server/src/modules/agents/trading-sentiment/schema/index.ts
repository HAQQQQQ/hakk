import { z } from "zod";
import { coreSentimentSchema } from "./core-sentiment.schema";
import { cognitiveBiasSchema } from "./cognitive-bias.schema";
import { marketTradeSchema } from "./market-trade.schema";
import { strategyRiskSchema } from "./strategy-risk.schema";
import { additionalAnalysisSchema } from "./additional-analysis.schema";
import { recommendationsSchema } from "./recommendations.schema";

// Combine all schemas into one comprehensive schema
export const tradingSentimentSchema = z.object({
	...coreSentimentSchema.shape,
	...cognitiveBiasSchema.shape,
	...marketTradeSchema.shape,
	...strategyRiskSchema.shape,
	...additionalAnalysisSchema.shape,
	...recommendationsSchema.shape,
});

// Export all individual schemas for potential standalone use
export * from "./core-sentiment.schema";
export * from "./cognitive-bias.schema";
export * from "./market-trade.schema";
export * from "./strategy-risk.schema";
export * from "./additional-analysis.schema";
export * from "./recommendations.schema";
