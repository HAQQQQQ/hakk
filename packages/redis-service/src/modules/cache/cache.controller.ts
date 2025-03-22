import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('cache')
export class CacheController {
	constructor(private readonly cacheService: CacheService) {}

	@Post('/set')
	async setKey(
		@Body() body: { key: string; value: string; ttl?: number },
	): Promise<string> {
		await this.cacheService.set(body.key, body.value, body.ttl);
		return `✅ Key "${body.key}" has been set successfully.`;
	}

	@Get('/get/:key')
	async getKey(@Param('key') key: string): Promise<string | null> {
		return await this.cacheService.get(key);
	}

	@Delete('/delete/:key')
	async deleteKey(@Param('key') key: string): Promise<string> {
		await this.cacheService.delete(key);
		return `✅ Key "${key}" has been deleted.`;
	}

	@Get('/exists/:key')
	async checkKeyExists(@Param('key') key: string): Promise<boolean> {
		return await this.cacheService.exists(key);
	}
}
