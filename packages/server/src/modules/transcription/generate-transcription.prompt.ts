/**
 * Generates the system/user prompt for asking the LLM to extract
 * structured insights from a journal entry.
 *
 * @param entryText The raw journal text to analyze
 * @returns A full prompt string ready to send to OpenAI
 */
export function generateTranscriptionPrompt(entryText: string): string {
	const escaped = entryText.trim();
	return `
        Here is my journal entry—please extract:
            1) The date of the entry.
            2) My overall mood.
            3) Key positive highlights.
            4) Any challenges.
            5) Suggested next action items.

            Journal Entry:
            """${escaped}"""
            `.trim();
}
