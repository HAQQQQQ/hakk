// test/test.module.ts
import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";
import { SupabaseService } from "../supabase/supabase.service";

@Module({
	controllers: [TestController],
	providers: [TestService, SupabaseService],
})
export class TestModule {}
