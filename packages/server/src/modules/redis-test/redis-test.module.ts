import { Module } from "@nestjs/common";
import { RedisTestService } from "./redis-test.service.js";
import { RedisTestController } from "./redis-test.controller.js";
import { RedisClientModule } from "../redis-client/redis-client.module.js";

@Module({
	imports: [RedisClientModule],
	providers: [RedisTestService],
	controllers: [RedisTestController],
})
export class RedisTestModule {}
