// schemas/match.schema.ts
import { z } from "zod";

export const MatchSchema = z.object({
	userA: z.string(),
	userB: z.string(),
});

export type MatchInput = z.infer<typeof MatchSchema>;
