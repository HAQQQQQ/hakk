/**
 * Enhanced weather tool implementation with validation and caching
 */
import { ToolCategory, ToolFactory } from "./tool-registry";
import { ExtendedToolDefinition } from "./tool-registry";
import { z } from "zod";

/**
 * Schema for weather tool parameters
 */
const weatherSchema = z.object({
	location: z
		.string()
		.min(2)
		.describe('Location to get weather for (e.g., "New York" or "London, UK")'),
	unit: z.enum(["celsius", "fahrenheit"]).default("celsius").describe("Temperature unit"),
});

/**
 * Type for weather parameters
 */
type WeatherParams = z.infer<typeof weatherSchema>;

/**
 * Weather conditions type
 */
type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy";

/**
 * Weather response type
 */
interface WeatherResponse {
	location: string;
	temperature: number;
	condition: WeatherCondition;
	humidity?: number;
	windSpeed?: number;
	unit: "celsius" | "fahrenheit";
	timestamp: number;
}

/**
 * Simple weather cache with expiration
 */
class WeatherCache {
	private cache: Map<string, WeatherResponse> = new Map();
	private readonly cacheDuration = 15 * 60 * 1000; // 15 minutes

	/**
	 * Get cached weather for a location
	 *
	 * @param location - Location to get weather for
	 * @param unit - Temperature unit
	 * @returns Cached weather data or undefined if not found or expired
	 */
	get(location: string, unit: "celsius" | "fahrenheit"): WeatherResponse | undefined {
		const key = `${location.toLowerCase()}:${unit}`;
		const cached = this.cache.get(key);

		if (!cached) return undefined;

		// Check if cache is expired
		if (Date.now() - cached.timestamp > this.cacheDuration) {
			this.cache.delete(key);
			return undefined;
		}

		return cached;
	}

	/**
	 * Set weather data in cache
	 *
	 * @param location - Location
	 * @param unit - Temperature unit
	 * @param data - Weather data to cache
	 */
	set(
		location: string,
		unit: "celsius" | "fahrenheit",
		data: Omit<WeatherResponse, "timestamp">,
	): void {
		const key = `${location.toLowerCase()}:${unit}`;
		this.cache.set(key, {
			...data,
			timestamp: Date.now(),
		});
	}

	/**
	 * Clear expired entries from cache
	 */
	clearExpired(): void {
		const now = Date.now();
		for (const [key, value] of this.cache.entries()) {
			if (now - value.timestamp > this.cacheDuration) {
				this.cache.delete(key);
			}
		}
	}
}

// Singleton cache instance
const weatherCache = new WeatherCache();

// Clear expired entries periodically
setInterval(() => weatherCache.clearExpired(), 5 * 60 * 1000);

/**
 * Mock function to fetch weather from an API
 * In a real implementation, this would call a weather API
 *
 * @param location - Location to get weather for
 * @param unit - Temperature unit
 * @returns Weather data
 */
async function fetchWeatherFromApi(
	location: string,
	unit: "celsius" | "fahrenheit",
): Promise<Omit<WeatherResponse, "timestamp">> {
	// In a real implementation, this would make an API call
	console.log(`Simulating API call for weather in ${location} (${unit})`);

	// Simulate network latency
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Deterministic "random" temperature based on location string
	const hash = location.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const baseTemp = (hash % 40) - 5; // -5 to 35 celsius

	// Convert to fahrenheit if needed
	const temp = unit === "celsius" ? baseTemp : (baseTemp * 9) / 5 + 32;

	// Deterministic condition based on location
	const conditions: WeatherCondition[] = ["sunny", "cloudy", "rainy", "snowy", "stormy", "foggy"];
	const conditionIndex = hash % conditions.length;

	return {
		location,
		temperature: parseFloat(temp.toFixed(1)),
		condition: conditions[conditionIndex],
		humidity: 50 + (hash % 40), // 50-90%
		windSpeed: 5 + (hash % 20), // 5-25 km/h
		unit,
	};
}

/**
 * Enhanced weather tool with validation and caching
 */
export const weatherTool: ExtendedToolDefinition = ToolFactory.createApiTool({
	name: "get_weather",
	description: "Get current weather for a location",
	parameters: {
		type: "object",
		properties: {
			location: {
				type: "string",
				description: 'Location to get weather for (e.g., "New York" or "London, UK")',
			},
			unit: {
				type: "string",
				enum: ["celsius", "fahrenheit"],
				default: "celsius",
				description: "Temperature unit",
			},
		},
		required: ["location"],
	},
	execute: async (args: Record<string, unknown>) => {
		// Validate arguments with zod
		try {
			const { location, unit } = weatherSchema.parse(args);

			// Check cache first
			const cached = weatherCache.get(location, unit);
			if (cached) {
				return {
					...cached,
					cached: true,
					cachedAt: new Date(cached.timestamp).toISOString(),
				};
			}

			// Fetch weather data
			const weatherData = await fetchWeatherFromApi(location, unit);

			// Cache the result
			weatherCache.set(location, unit, weatherData);

			// Return the weather data
			return {
				...weatherData,
				cached: false,
			};
		} catch (e) {
			if (e instanceof z.ZodError) {
				throw new Error(
					`Invalid arguments: ${e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")}`,
				);
			}
			throw e;
		}
	},
	version: "1.0.0",
	rateLimited: true,
	timeout: 5000,
});
