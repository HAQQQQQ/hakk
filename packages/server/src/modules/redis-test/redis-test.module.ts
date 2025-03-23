import { Module } from "@nestjs/common";
import { RedisTestService } from "./redis-test.service";
import { RedisTestController } from "./redis-test.controller";
import { RedisClientModule } from "../redis-client/redis-client.module";

@Module({
	imports: [RedisClientModule],
	providers: [RedisTestService],
	controllers: [RedisTestController],
})
export class RedisTestModule {}
