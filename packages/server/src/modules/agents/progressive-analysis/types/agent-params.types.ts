export type IterativePromptParams = {
	basePrompt: string;
	previousResponses?: string[];
	iterationNumber?: number;
	analysisGoal?: string;
};
