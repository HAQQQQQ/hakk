import { config } from 'dotenv';

// Initialize dotenv
config();

/**
 * Central configuration class for application settings
 * Provides type-safe access to environment variables with sensible defaults
 */
export class AppConfig {
	static readonly port: number = parseInt(process.env.PORT ?? '3002', 10);

	static readonly redisPort: number = parseInt(
		process.env.REDIS_PORT ?? '6379',
		10,
	);

	static readonly redisHost: string = process.env.REDIS_HOST ?? 'localhost';
}
