import { Module } from "@nestjs/common";
import { DataService } from "./services/data.service";
import { DataController } from "./controllers/data.controller";
import { DataRepository } from "./repo/data.repository";
import { SupabaseModule } from "../supabase/supabase.module";
import { UserModule } from "../user/user.module";

@Module({
	imports: [SupabaseModule, UserModule],
	providers: [DataService, DataRepository],
	controllers: [DataController],
})
export class DataModule {}
