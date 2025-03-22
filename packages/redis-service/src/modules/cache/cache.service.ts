import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
	private client: RedisClientType;

	async onModuleInit() {
		const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
		console.log('url', url);
		this.client = createClient({ url });

		this.client.on('error', (err) => console.error('❗ Redis Error:', err));

		await this.client.connect();
		console.log('✅ Redis connected successfully');
		console.log(`Redis running on url ${url}`);
	}

	async onModuleDestroy() {
		await this.client.quit();
		console.log('❌ Redis disconnected');
	}

	async set(key: string, value: string, ttlInSeconds = 3600): Promise<void> {
		await this.client.set(key, value, { EX: ttlInSeconds });
	}

	async get(key: string): Promise<string | null> {
		return await this.client.get(key);
	}

	async delete(key: string): Promise<void> {
		await this.client.del(key);
	}

	async exists(key: string): Promise<boolean> {
		return (await this.client.exists(key)) === 1;
	}
}
