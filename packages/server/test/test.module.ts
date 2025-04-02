// test/test.module.ts
import { Module } from "@nestjs/common";
import { TestController } from "./test.controller.js";
import { TestService } from "./test.service.js";
import { SupabaseService } from "@/modules/supabase/supabase.service.js";

@Module({
	controllers: [TestController],
	providers: [TestService, SupabaseService],
})
export class TestModule {}
