import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ProfileModule } from "./modules/profile/profile.module.js";
import { OpenAIModule } from "./modules/openai/openai.module.js";
import { SupabaseService } from "./modules/supabase/supabase.service.js";
import { TestModule } from "../test/test.module.js";
import { InterestsModule } from "./modules/interests/interests.module.js";
import { PreferencesModule } from "@modules/preferences/preferences.module.js";
import { RedisClientModule } from "./modules/redis-client/redis-client.module.js";
import { ApiAuthMiddleware } from "./common/middlewares/api-auth.middleware.js";
import { EnvConfig } from "./config/env.config.js";
import { PreComputeModule } from "./modules/precompute/pre-compute.module.js";
import { MatchingModule } from "./modules/matching/matching.module.js";

@Module({
	imports: [
		ProfileModule,
		TestModule,
		OpenAIModule,
		InterestsModule,
		PreferencesModule,
		RedisClientModule,
		PreComputeModule,
		MatchingModule,

		// **** Tech Debt: Maybe use NesJs ConfigModule to fetch env stuff ****
		// ConfigModule.forRoot({
		//     // Order matters - later files override earlier ones
		//     envFilePath: [
		//         // Server-specific .env (higher priority)
		//         path.resolve(),
		//         // Root .env (lower priority)
		//         path.resolve(__dirname, '../../../../../.env'),
		//     ],
		//     isGlobal: true,
		// }),
	],
	controllers: [AppController],
	providers: [AppService, SupabaseService],
	exports: [SupabaseService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Apply the ApiAuthMiddleware to all routes

		if (EnvConfig.useNginx) {
			consumer.apply(ApiAuthMiddleware).forRoutes("*");
		}
	}
}
