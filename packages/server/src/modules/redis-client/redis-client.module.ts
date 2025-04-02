import { Module } from "@nestjs/common";
import { RedisClientService } from "./redis-client.service.js";

@Module({
	providers: [RedisClientService],
	exports: [RedisClientService],
})
export class RedisClientModule {}
