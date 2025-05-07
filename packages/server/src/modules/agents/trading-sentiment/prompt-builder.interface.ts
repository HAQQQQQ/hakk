/**
 * Interface that all prompt builders must implement
 * Ensures each prompt builder has a consistent build method
 */
export interface PromptBuilder<T, X = undefined> {
	/**
	 * Builds a prompt for the AI agent
	 * @param input The primary input for the prompt
	 * @param options Optional additional data needed for prompt generation
	 * @returns A formatted prompt string
	 */
	build(input: T, options?: X): string;
}
