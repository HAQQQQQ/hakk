import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CacheModule } from './modules/cache/cache.module.js';

@Module({
	imports: [CacheModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
