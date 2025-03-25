import { OpenAIModel } from "../modules/openai/openai-models.enum";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config();
config({ path: resolve(__dirname, "../../../../../.env") });

// Interface for environment variables
export interface EnvConfig {
	port: number;
	useNginx: boolean;
	clientPort: number;
	supabaseUrl: string;
	supabaseKey: string;
	redisServicePort: number;
	openaiApiKey: string;
	gptModel: OpenAIModel;
	openaiTemperature: number;
	nginxHeaderName: string;
	nginxSecureKey: string;
}

// Configuration Object — Cleaner Access
export const Config: EnvConfig = {
	port: parseInt(process.env.SERVER_PORT ?? "3001", 10),
	useNginx: process.env.USE_NGINX?.toLowerCase() === "true",
	clientPort: parseInt(process.env.CLIENT_PORT ?? "3000", 10),
	supabaseUrl: process.env.SUPABASE_URL ?? "",
	supabaseKey: process.env.SUPABASE_KEY ?? "",
	redisServicePort: parseInt(process.env.REDIS_SERVICE_PORT ?? "3002", 10),
	openaiApiKey: process.env.OPENAI_API_KEY ?? "",
	gptModel: (() => {
		const envModel = process.env.GPT_MODEL ?? "";
		return Object.values(OpenAIModel).includes(envModel as OpenAIModel)
			? (envModel as OpenAIModel)
			: OpenAIModel.GPT_3_5_TURBO;
	})(),
	openaiTemperature: (() => {
		const temp = parseFloat(process.env.OPENAI_TEMPERATURE ?? "0");
		return !isNaN(temp) && temp >= 0 && temp <= 2 ? temp : 0;
	})(),
	nginxHeaderName: process.env.NGINX_HEADER_NAME ?? "",
	nginxSecureKey: process.env.NGINX_SECURE_KEY ?? "",
};
