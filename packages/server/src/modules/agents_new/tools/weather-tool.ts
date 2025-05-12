/**
 * Weather tool implementation
 */
import { ToolDefinition } from "./tool-executor";

/**
 * Weather tool for getting current weather information
 */
export const weatherTool: ToolDefinition = {
	name: "get_weather",
	description: "Get current weather for a location",
	parameters: {
		type: "object",
		properties: {
			location: {
				type: "string",
				description: 'City name, e.g., "New York" or "London, UK"',
			},
			unit: {
				type: "string",
				enum: ["celsius", "fahrenheit"],
				default: "celsius",
			},
		},
		required: ["location"],
	},
	execute: async ({ location, unit }) => {
		// In a real implementation, this would call a weather API
		console.log(`Getting weather for ${location} in ${unit}`);

		return {
			temperature: 22,
			unit: unit || "celsius",
			condition: "Sunny",
			location,
		};
	},
};
