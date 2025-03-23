import { Test, TestingModule } from "@nestjs/testing";
import { RedisTestController } from "./redis-test.controller";

describe("RedisTestController", () => {
	let controller: RedisTestController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RedisTestController],
		}).compile();

		controller = module.get<RedisTestController>(RedisTestController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
