import { Body, Controller, Post } from "@nestjs/common";
import { SupabaseService } from "@/modules/supabase/supabase.service";
import { Preference } from '@hakk/types';
import { TestService } from "./test.service";

@Controller("test")
export class TestController {
    constructor(
        private readonly testService: TestService,
        private readonly supabaseService: SupabaseService,
    ) { }

    @Post("add-preferences")
    async addPreferences(@Body() body: { userId: string; preference: Preference }): Promise<any> {
        const { userId, preference } = body;

        // Add or update the preference
        await this.supabaseService.addPreference(userId, preference);

        // Fetch the updated preference for the user
        const updatedPreference: Preference[] = await this.supabaseService.getPreferences([userId]);

        // Log the fetched preferences to the console
        console.log("Updated Preference:", updatedPreference);

        // Return the updated preference to the client
        return updatedPreference;
    }
}
