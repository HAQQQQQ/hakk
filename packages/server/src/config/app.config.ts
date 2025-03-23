import { config } from 'dotenv';
import { OpenAIModel } from "../modules/openai/openai-models.enum";

// Initialize dotenv
config();

/**
 * Central configuration class for application settings
 * Provides type-safe access to environment variables with sensible defaults
 */
export class AppConfig {
    // Server configuration
    static readonly port: number = (() => {
        const defaultPort = AppConfig.useNginx ? '8080' : '3001';
        return parseInt(process.env.PORT ?? defaultPort, 10);
    })();

    static readonly useNginx: boolean = (() => {
        const value = process.env.USE_NGINX;
        return value?.toLowerCase() === 'true';
    })();

    // Supabase configuration
    static readonly supabaseUrl: string = process.env.SUPABASE_URL ?? '';
    static readonly supabaseKey: string = process.env.SUPABASE_KEY ?? '';

    // Redis configuration
    static readonly redisServicePort: number = parseInt(process.env.REDIS_SERVICE_PORT ?? '3002', 10);

    // OpenAI configuration
    static readonly openaiApiKey: string = process.env.OPENAI_API_KEY ?? '';

    // Validate and convert GPT model at initialization time
    static readonly gptModel: OpenAIModel = (() => {
        const envModel = process.env.GPT_MODEL ?? '';
        if (envModel && Object.values(OpenAIModel).includes(envModel as OpenAIModel)) {
            return envModel as OpenAIModel;
        }
        return OpenAIModel.GPT_3_5_TURBO;
    })();

    // Parse and validate temperature at initialization time
    static readonly openaiTemperature: number = (() => {
        const temp = parseFloat(process.env.OPENAI_TEMPERATURE ?? '0');
        return !isNaN(temp) && temp >= 0 && temp <= 2 ? temp : 0;
    })();

    // /**
    //  * Validates that all required configuration is present
    //  * @throws Error if any required configuration is missing
    //  */
    // static validate(): void {
    //     const requiredVars = [
    //         { name: 'SUPABASE_URL', value: this.supabaseUrl },
    //         { name: 'SUPABASE_KEY', value: this.supabaseKey },
    //         { name: 'OPENAI_API_KEY', value: this.openaiApiKey }
    //     ];

    //     const missing = requiredVars
    //         .filter(v => !v.value)
    //         .map(v => v.name);

    //     if (missing.length > 0) {
    //         throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    //     }
    // }

}