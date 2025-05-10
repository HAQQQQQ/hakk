export const sentimentAnalysisPromptTemplate = (journalEntry: string): string => {
	return `Trading Journal Entry: "${journalEntry}"
      
    Please analyze this trading journal entry for psychological patterns, emotions, 
    cognitive biases, and provide actionable recommendations.`;
};
