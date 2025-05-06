import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { UserModule } from "../user/user.module";
import { CsvParserModule } from "../csv-parser/csv-parser.module";
import { PnlDataService } from "./services/pnl-data.service";
import { PnlDataRepository } from "./repo/pnl-data.repository";
import { PnlDataController } from "./controllers/pnl-data.controller";

@Module({
	imports: [SupabaseModule, UserModule, CsvParserModule],
	providers: [PnlDataService, PnlDataRepository],
	controllers: [PnlDataController],
})
export class DataModule {}
