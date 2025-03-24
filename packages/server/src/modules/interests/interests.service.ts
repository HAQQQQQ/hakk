import { Injectable } from "@nestjs/common";
import { OpenAIService } from "../openai/openai.service";
import { Preference } from "packages/types/dist";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class InterestsService {
    constructor(private readonly openaiservive: OpenAIService, private readonly supabaseService: SupabaseService){}

    async addInterest(userId: string, preference: Preference){
        let interests = await this.openaiservive.completePrompt(JSON.stringify(preference));
        let data = this.supabaseService.addInterest(userId, interests);
    }

}

//function to call openai servive, generate interest. make userid argument, preference list argument
//cache interest object in redis, by userid