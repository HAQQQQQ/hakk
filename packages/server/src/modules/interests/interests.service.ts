import { Injectable } from "@nestjs/common";
import { RedisClientService } from "../redis-client/redis-client.service";
import { InterestResponseDto } from "../interests/interests.controller"; // Import the DTO

@Injectable()
export class InterestsService {
	constructor(private readonly redisService: RedisClientService) {}

	private readonly mockInterests: InterestResponseDto[] = [
		{ id: 1, name: "Fitness" },
		{ id: 2, name: "Music" },
		{ id: 3, name: "Travel" },
		{ id: 4, name: "Technology" },
		{ id: 5, name: "Cooking" },
	];

	// ✅ Load data into Redis only on a cache miss
	private async loadMockDataToRedis(): Promise<void> {
		console.log("🔄 Loading mock data into Redis...");
		for (const interest of this.mockInterests) {
			await this.redisService.setKey(`interest:${interest.id}`, JSON.stringify(interest));
		}
		console.log("✅ Mock data successfully loaded into Redis.");
	}

	async getAllInterests(): Promise<any> {
		const cachedData = await this.redisService.getKey("all-interests");

		if (cachedData) {
			console.log("✅ Cache hit - Returning data from Redis");
			try {
				console.log("data:", cachedData); // ✅ Logs parsed data for debugging
				return cachedData;
			} catch (error) {
				console.error("❗ Failed to parse cached data. Reloading mock data...");
			}
		}

		console.log("❗ Cache miss - Loading data into Redis");

		// Cache miss — load data into Redis
		await this.loadMockDataToRedis();

		// Save the full data set for faster future access
		await this.redisService.setKey("all-interests", JSON.stringify(this.mockInterests));

		return this.mockInterests;
	}

	// Retrieve a single interest by ID (handles cache misses)
	async getInterestById(id: number): Promise<any> {
		//<InterestResponseDto | null> {
		const data = await this.redisService.getKey(`interest:${id}`);

		if (data) {
			console.log(`✅ Cache hit - Found data for interest:${id}`);
			return data; // JSON.parse(data) as InterestResponseDto;
		}

		console.log(`❗ Cache miss - Loading data for interest:${id} into Redis`);

		// Cache miss — load data for the missing interest only
		const interest = this.mockInterests.find((i) => i.id === id);
		if (!interest) return null;

		await this.redisService.setKey(`interest:${id}`, JSON.stringify(interest));
		return interest;
	}

	async deleteFromCache(): Promise<string> {
		console.log("🧹 Deleting hardcoded mock data from Redis...");

		// Delete all individual entries
		for (const interest of this.mockInterests) {
			await this.redisService.deleteKey(`interest:${interest.id}`);
		}

		// Delete the 'all-interests' entry
		await this.redisService.deleteKey("all-interests");

		console.log("✅ All mock data successfully removed from Redis.");
		return "✅ All mock data successfully removed from Redis.";
	}
}
