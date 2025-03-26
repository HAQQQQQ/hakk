import { EnvConfig } from "./env.config";

export class AppConfig {
	static validate(): void {
		const missingVars: string[] = [];

		if (!EnvConfig.supabaseUrl) missingVars.push("SUPABASE_URL");
		if (!EnvConfig.supabaseKey) missingVars.push("SUPABASE_KEY");
		if (!EnvConfig.openaiApiKey) missingVars.push("OPENAI_API_KEY");

		if (missingVars.length > 0) {
			throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
		}
	}
}
