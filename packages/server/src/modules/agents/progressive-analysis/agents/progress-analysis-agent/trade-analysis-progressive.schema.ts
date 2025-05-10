import { z } from "zod";
import { createProgressiveAnalysisSchema } from "./progressive-analysis.schema";
import { generalTradingSchema } from "@/modules/agents/trading-sentiment/agents/general-analysis-agent/general-analysis.schema";

/**
 * Progressive analysis schema for trading analysis
 * This uses the generalTradingSchema as the target schema
 */
export const tradingProgressiveAnalysisSchema =
	createProgressiveAnalysisSchema(generalTradingSchema);

/**
 * Type for trading progressive analysis results, derived directly from the schema
 */
export type TradingProgressiveAnalysisResult = z.infer<typeof tradingProgressiveAnalysisSchema>;
