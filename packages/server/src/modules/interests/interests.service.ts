import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "packages/types/dist";
import { SupabaseService } from "../supabase/supabase.service";
import { generatePrompt } from "../openai/openai.constants";

@Injectable()
export class InterestsService {
    constructor(private readonly openaiservive: OpenAIService, private readonly supabaseService: SupabaseService){}

    async addInterest(userId: string, preference: Preference){
        let interests = await this.openaiservive.completePrompt(generatePrompt(JSON.stringify(preference)));
        console.log("interests in add interests ", interests);
        let interestsArray: string[] = [interests];
        return this.supabaseService.addInterest(userId, interestsArray);
    }

}

//function to call openai servive, generate interest. make userid argument, preference list argument
//cache interest object in redis, by userid