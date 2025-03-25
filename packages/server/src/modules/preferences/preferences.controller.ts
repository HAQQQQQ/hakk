import { Body, Controller, Post } from "@nestjs/common";
import { Preference } from "@hakk/types";
import { PreferencesService } from "./preferences.service";

@Controller("preferences")
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) { }

    @Post()
    async savePreferences(@Body() body: { userId: string; preference: Preference }): Promise<{ message: string; data: any }> {
        console.log('In Prefernces controller');
        const data = this.preferencesService.addPreference(body.userId, body.preference);
        // console.log("in preference controller 1");
        // let data = await this.preferencesService.addPreference(body.userId, body.preference);
        return { message: "Preferences saved successfully", data: data };
    }
}


/*

curl -X POST http://localhost:3001/api/preferences \
-H "Content-Type: application/json" \
-d '{
"userId": "user_2udhMJbOA4zqkztKzYXxlULWo42",
    "preferences": {
    "music": ["Rock", "Jazz", "Hip-hop"],
        "movie": ["Action", "Sci-fi", "Comedy"],
            "hobby": ["Woodworking", "Gaming", "Cycling"]
}
}'

*/
