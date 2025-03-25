import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "@hakk/types";
import { SupabaseService } from "../supabase/supabase.service";
import { generatePrompt } from "../openai/openai.constants";

@Injectable()
export class InterestsService {
    constructor(private readonly openaiservive: OpenAIService, private readonly supabaseService: SupabaseService) { }

    async addInterest(userId: string, preference: Preference) {
        console.log('pref:', preference);
        // let interests = await this.openaiservive.completePrompt(generatePrompt(JSON.stringify(preference)));

        const jsonObject: {}[] = [JSON.parse(await this.getPrompt(preference))];
 
        return this.supabaseService.addInterest(userId, jsonObject);
    }


    private async getPrompt(preference: Preference): Promise<string> {
        return this.openaiservive.completePrompt(generatePrompt(JSON.stringify(preference)));
    }
}



//function to call openai servive, generate interest. make userid argument, preference list argument
//cache interest object in redis, by userid
