import { Module } from '@nestjs/common';
import { CacheService } from './cache.service.js';
import { CacheController } from './cache.controller.js';

@Module({
	providers: [CacheService],
	controllers: [CacheController],
})
export class CacheModule {}
