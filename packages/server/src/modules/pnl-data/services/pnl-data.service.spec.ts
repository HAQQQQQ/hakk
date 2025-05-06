import { Test, TestingModule } from "@nestjs/testing";
import { PnlDataService } from "./pnl-data.service";

describe("PnlDataService", () => {
	let service: PnlDataService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PnlDataService],
		}).compile();

		service = module.get<PnlDataService>(PnlDataService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
