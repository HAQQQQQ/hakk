import { Preference } from "@hakk/types";

export function generateInterestsPrompt(preference: Preference): string {
	// Preference): string {
	const inputString = JSON.stringify(preference, null, 2);
	return `
		Given the following input object:

		${inputString}

		Please analyze and extract general insights about each category.

		For **music**, identify:
		- The primary music genres associated with the artists.
		- The overall mood or feel of their songs.

		For **movies**, determine:
		- The genres these films represent.
		- Any notable time periods reflected in the films.
		- Relevant cultural contexts (e.g., whether they are foreign or local productions).

		For **hobbies**, describe:
		- The lifestyle they suggest.
		- The personality traits that might be indicated.
		- Related activities or interests the user might enjoy.

		Return the output as a JSON object with the following structure:

		{
		  "music": {
			"genres": ["..."],
			"mood": "..."
		  },
		  "movies": {
			"genres": ["..."],
			"time_periods": ["..."],
			"cultural_context": ["..."]
		  },
		  "hobbies": {
			"lifestyle": "...",
			"personality": "...",
			"related_activities": ["..."]
		  }
		}

		Provide your analysis in the exact JSON format as shown above.
		`;
}
