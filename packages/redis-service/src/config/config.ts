import { config } from 'dotenv';
import { resolve } from 'path';

// Initialize dotenv
// config();

config();
config({ path: resolve(__dirname, "../../../../../.env") });

/**
 * Central configuration class for application settings
 * Provides type-safe access to environment variables with sensible defaults
 */
export class Config {
    static readonly port: number = parseInt(process.env.PORT ?? '3002', 10);

    static readonly redisPort: number = parseInt(
        process.env.REDIS_PORT ?? '6379',
        10,
    );

    static readonly redisHost: string = process.env.REDIS_HOST ?? 'localhost';
}
