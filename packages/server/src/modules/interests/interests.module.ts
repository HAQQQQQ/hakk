import { Module } from "@nestjs/common";
import { InterestsController } from "./interests.controller";
import { InterestsService } from "./interests.service";
import { RedisClientModule } from "../redis-client/redis-client.module";

@Module({
	imports: [RedisClientModule],
	controllers: [InterestsController],
	providers: [InterestsService],
})
export class InterestsModule {}
