import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProfileModule } from "./modules/profile/profile.module";
import { OpenAIModule } from "./modules/openai/openai.module";
import { UsersController } from "./modules/users/users.controller";
import { SupabaseService } from "./modules/supabase/supabase.service";
import { TestModule } from "../test/test.module";
import { InterestsModule } from "./modules/interests/interests.module";
import { PreferencesModule } from "@modules/preferences/preferences.module";
import { RedisClientModule } from "./modules/redis-client/redis-client.module";
import { ApiAuthMiddleware } from "./common/middlewares/api-auth.middleware";
import { Config } from "./config/config";

@Module({
    imports: [
        ProfileModule,
        TestModule,
        OpenAIModule,
        InterestsModule,
        PreferencesModule,
        RedisClientModule,

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
    controllers: [AppController, UsersController],
    providers: [AppService, SupabaseService],
    exports: [SupabaseService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply the ApiAuthMiddleware to all routes

        if (Config.useNginx) {
            consumer.apply(ApiAuthMiddleware).forRoutes("*");
        }
    }
}
