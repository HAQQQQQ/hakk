// src/interests/schemas.ts
import { z } from "zod";

// Define schemas for each section
export const musicAnalysisSchema = z.object({
	genres: z.array(z.string()),
	mood: z.string(),
});

export const movieAnalysisSchema = z.object({
	genres: z.array(z.string()),
	time_periods: z.array(z.string()),
	cultural_context: z.array(z.string()),
});

export const hobbyAnalysisSchema = z.object({
	lifestyle: z.string(),
	personality: z.string(),
	related_activities: z.array(z.string()),
});

// Combine into the complete response schema
export const interestAnalysisSchema = z.object({
	music: musicAnalysisSchema,
	movies: movieAnalysisSchema,
	hobbies: hobbyAnalysisSchema,
});

// Create TypeScript type from the schema
export type InterestAnalysis = z.infer<typeof interestAnalysisSchema>;
