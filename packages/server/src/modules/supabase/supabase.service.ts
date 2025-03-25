import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Preference } from "@hakk/types";
@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_KEY;

        if (!SUPABASE_URL || !SUPABASE_KEY) {
            throw new Error("Supabase credentials are missing. Check your environment variables.");
        }

        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    async getUsers(): Promise<any> {
        console.log("Fetching users from Supabase...");
        const { data, error } = await this.supabase.from("users").select("*");
        if (error) throw error;
        return data;
    }

    async checkUserExists(userId: string): Promise<void> {
        const { data: user, error } = await this.supabase
            .from("profiles")
            .select("user_id")
            .eq("user_id", userId)
            .single();

        if (error || !user) {
            throw new Error("User not found. Please check the user ID.");
        }
    }

    async addPreference(userId: string, preference: Preference): Promise<any> {
        // Ensure the user exists by calling the new method
        await this.checkUserExists(userId);

        // Insert the preference for the user into the 'preferences' table.
        // Here, the entire preference object is stored in a JSONB column named "data".
        const { data, error } = await this.supabase.from("preferences").upsert(
            [
                {
                    user_id: userId,
                    preference: preference, // Stores the entire preference object
                },
            ],
            { onConflict: "user_id" },
        );

        if (error) throw error;

        return data;
    }

    async getPreferences(userIds: string[]): Promise<Preference[]> {
        const { data, error } = await this.supabase
            .from("preferences")
            .select("preference")
            .in("user_id", userIds);

        if (error) throw error;

        return data.map((item: { preference: Preference }) => item.preference);
    }

    // async addInterest(userId: string, newInterests: string[]): Promise<any> {
    async addInterest(userId: string, newInterests: {}[]): Promise<any> {
        // console.log('1) updatedIntets b4:', newInterests);
        // await this.checkUserExists(userId);

        // // Fetch existing interests from the database
        // const { data: existingData, error: fetchError } = await this.supabase
        //     .from("preferences")
        //     .select("interests")
        //     .eq("user_id", userId)
        //     .single();

        // if (fetchError && fetchError.code !== "PGRST116") { // Ignore "row not found" error
        //     console.error("Error fetching existing interests:", fetchError);
        //     return fetchError;
        // }
        // console.log('2) updatedIntets b4:', newInterests);
        // // Merge existing interests with new ones (avoiding duplicates)
        // const existingInterests = existingData?.interests || [];
        // console.log('existingIntersts:', existingInterests);
        // const updatedInterests = Array.from(new Set([...newInterests, ...existingInterests])); // Ensure unique values
        // console.log('updatedIntets after:', updatedInterests);
        // // Upsert merged interests back into the database
        const { data, error } = await this.supabase.from("preferences").upsert(
            [
                {
                    user_id: userId,
                    interests: newInterests[0], // Store updated array
                }
            ],
            { onConflict: "user_id" } // Ensures update instead of insert conflict
        );

        if (error) {
            console.error("Error in addInterest:", error);
            return error;
        }

        return data;
    }


}
