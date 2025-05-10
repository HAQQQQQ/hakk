// import { z } from "zod";
// import { coreSentimentSchema } from "../../trading-sentiment/sentiment-analysis-agent/core-sentiment.schema";
// import { cognitiveBiasSchema } from "../../trading-sentiment/contextual-sentiment-agent/cognitive-bias.schema";
// import { marketTradeSchema } from "../../trading-sentiment/performance-analysis-agent/market-trade.schema";
// import { strategyRiskSchema } from "../../trading-sentiment/trend-analysis-agent/strategy-risk.schema";
// import { additionalAnalysisSchema } from "../../trading-sentiment/psychological-issues-agent/additional-analysis.schema";
// import { recommendationsSchema } from "../../trading-sentiment/psychology-plan-agent/recommendations.schema";

// // Combine all schemas into one comprehensive schema
// export const tradingSentimentSchema = z.object({
// 	...coreSentimentSchema.shape,
// 	...cognitiveBiasSchema.shape,
// 	...marketTradeSchema.shape,
// 	...strategyRiskSchema.shape,
// 	...additionalAnalysisSchema.shape,
// 	...recommendationsSchema.shape,
// });

// // Export all individual schemas for potential standalone use
// export * from "../../trading-sentiment/sentiment-analysis-agent/core-sentiment.schema";
// export * from "../../trading-sentiment/contextual-sentiment-agent/cognitive-bias.schema";
// export * from "../../trading-sentiment/performance-analysis-agent/market-trade.schema";
// export * from "../../trading-sentiment/trend-analysis-agent/strategy-risk.schema";
// export * from "../../trading-sentiment/psychological-issues-agent/additional-analysis.schema";
// export * from "../../trading-sentiment/psychology-plan-agent/recommendations.schema";
