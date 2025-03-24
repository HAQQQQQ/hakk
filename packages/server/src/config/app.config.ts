import { config } from "dotenv";
import { OpenAIModel } from "../modules/openai/openai-models.enum";
import { resolve } from "path";

// Initialize dotenv
config();

// Load the root .env file (shared variables)
// (Maybe convert to using nestjs config in the future)
config({ path: resolve(__dirname, "../../../../../.env") });

// SUPABASE_URL =
// SUPABASE_KEY =
// CLIENT_PORT = 3000
// SERVER_PORT = 3001
// REDIS_SERVICE_PORT = 3002
// NGINX_PORT = 8080
// USE_NGINX = hello

/**
 * Central configuration class for application settings
 * Provides type-safe access to environment variables with sensible defaults
 */
export class AppConfig {
	// Server configuration
	static readonly port: number = (() => {
		// const defaultPort = AppConfig.useNginx ? "8080" : "3001";
		// return parseInt(process.env.SERVER_PORT ?? defaultPort, 10);
		return parseInt(process.env.SERVER_PORT ?? "3001", 10);
	})();

	static readonly useNginx: boolean = (() => {
		const value = process.env.USE_NGINX;
		return value?.toLowerCase() === "true";
	})();

	static readonly clientPort: number = (() => {
		return parseInt(process.env.CLIENT_PORT ?? "3000", 10);
	})();

	// Supabase configuration
	static readonly supabaseUrl: string = process.env.SUPABASE_URL ?? "";
	static readonly supabaseKey: string = process.env.SUPABASE_KEY ?? "";

	// Redis configuration
	static readonly redisServicePort: number = parseInt(
		process.env.REDIS_SERVICE_PORT ?? "3002",
		10,
	);

	// OpenAI configuration
	static readonly openaiApiKey: string = process.env.OPENAI_API_KEY ?? "";

	// Validate and convert GPT model at initialization time
	static readonly gptModel: OpenAIModel = (() => {
		const envModel = process.env.GPT_MODEL ?? "";
		if (envModel && Object.values(OpenAIModel).includes(envModel as OpenAIModel)) {
			return envModel as OpenAIModel;
		}
		return OpenAIModel.GPT_3_5_TURBO;
	})();

	// Parse and validate temperature at initialization time
	static readonly openaiTemperature: number = (() => {
		const temp = parseFloat(process.env.OPENAI_TEMPERATURE ?? "0");
		return !isNaN(temp) && temp >= 0 && temp <= 2 ? temp : 0;
	})();

	static readonly nginxHeaderName: string = (() => {
		return process.env.NGINX_HEADER_NAME ?? "";
	})();

	static readonly nginxSecureKey: string = (() => {
		return process.env.NGINX_SECURE_KEY ?? "";
	})();

	/**
	 * Validates critical environment variables are set
	 * Throws an error if any required variables are missing
	 */
	static validate(): void {
		const missingVars: string[] = [];

		if (!this.supabaseUrl) missingVars.push("SUPABASE_URL");
		if (!this.supabaseKey) missingVars.push("SUPABASE_KEY");
		if (!this.openaiApiKey) missingVars.push("OPENAI_API_KEY");

		if (missingVars.length > 0) {
			throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
		}
	}
}
