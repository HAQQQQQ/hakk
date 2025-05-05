import { OpenAIModel } from "@/modules/openai/openai.types";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config();
config({ path: resolve(__dirname, "../../../../../.env") });

// Interface for environment variables
export interface EnvConfigI {
	port: number;
	useNginx: boolean;
	clientPort: number;
	supabaseUrl: string;
	supabaseKey: string;
	redisServicePort: number;
	nginxHeaderName: string;
	nginxSecureKey: string;
	preCompute: boolean;
	matcherPort: number;
	openaiApiKey: string;
	gptModel: OpenAIModel;
	openaiTemperature: number;
	openaiMaxRetries: number;
	openaiRetryDelay: number;
	openaiSystemMessage: string;
}

// Configuration Object — Cleaner Access
export const EnvConfig: EnvConfigI = {
	// Server port for the application, defaults to 3001
	port: parseInt(process.env.SERVER_PORT ?? "3001", 10),

	// Flag indicating if the app runs behind Nginx proxy
	useNginx: process.env.USE_NGINX?.toLowerCase() === "true",

	// Port for client-side application, defaults to 3000
	clientPort: parseInt(process.env.CLIENT_PORT ?? "3000", 10),

	// Supabase URL for database connection
	supabaseUrl: process.env.SUPABASE_URL ?? "",

	// Supabase API key for authentication
	supabaseKey: process.env.SUPABASE_KEY ?? "",

	// Port for Redis service communication, defaults to 3002
	redisServicePort: parseInt(process.env.REDIS_SERVICE_PORT ?? "3002", 10),

	// Custom header name for Nginx security validation
	nginxHeaderName: process.env.NGINX_HEADER_NAME ?? "",

	// Secret key for Nginx security validation
	nginxSecureKey: process.env.NGINX_SECURE_KEY ?? "",

	// Flag to enable pre-computation of results
	preCompute: process.env.PRE_COMPUTE?.toLowerCase() === "true",

	// Port for the matcher service, defaults to 5000
	matcherPort: parseInt(process.env.MATCHER_PORT ?? "5000", 10),

	// OpenAI API key for authentication
	openaiApiKey: process.env.OPENAI_API_KEY ?? "",

	// OpenAI model selection with validation, falls back to GPT-3.5 Turbo
	gptModel: (() => {
		const envModel = process.env.GPT_MODEL ?? "";
		return Object.values(OpenAIModel).includes(envModel as OpenAIModel)
			? (envModel as OpenAIModel)
			: OpenAIModel.GPT_3_5_TURBO;
	})(),

	// OpenAI temperature (0-2) for randomness control, defaults to 0
	openaiTemperature: (() => {
		const temp = parseFloat(process.env.OPENAI_TEMPERATURE ?? "0");
		return !isNaN(temp) && temp >= 0 && temp <= 2 ? temp : 0;
	})(),

	// Max retry attempts for OpenAI API calls, defaults to 3
	openaiMaxRetries: parseInt(process.env.OPENAI_MAX_RETRIES ?? "3", 10),

	// Delay between retry attempts in milliseconds, defaults to 500
	openaiRetryDelay: parseInt(process.env.OPENAI_RETRY_DELAY ?? "500", 10),

	// Default system message for OpenAI, provides a functional fallback
	openaiSystemMessage:
		process.env.OPENAI_SYSTEM_MESSAGE ??
		"You are a helpful assistant that responds by calling the provided function.",
};
