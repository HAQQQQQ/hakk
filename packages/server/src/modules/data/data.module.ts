import { Module } from "@nestjs/common";
import { DataService } from "./services/data.service";
import { DataController } from "./controllers/data.controller";

@Module({
	providers: [DataService],
	controllers: [DataController],
})
export class DataModule {}
