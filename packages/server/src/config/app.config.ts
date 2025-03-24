import { Config } from "./config";

// Initialize dotenv
// config();

// // Load the root .env file (shared variables)
// // (Maybe convert to using nestjs config in the future)
// config({ path: resolve(__dirname, "../../../../../.env") });

// SUPABASE_URL =
// SUPABASE_KEY =
// CLIENT_PORT = 
// SERVER_PORT = 
// REDIS_SERVICE_PORT = 
// NGINX_PORT = 
// USE_NGINX = 

export class AppConfig {

    static validate(): void {
        const missingVars: string[] = [];

        if (!Config.supabaseUrl) missingVars.push("SUPABASE_URL");
        if (!Config.supabaseKey) missingVars.push("SUPABASE_KEY");
        if (!Config.openaiApiKey) missingVars.push("OPENAI_API_KEY");

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
        }
    }

}
