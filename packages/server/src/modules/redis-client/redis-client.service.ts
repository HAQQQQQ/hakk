import { EnvConfig } from "@/config/env.config";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class RedisClientService {
	private readonly redisServiceUrl = `http://localhost:${EnvConfig.redisServicePort}`;

	async setKey(key: string, value: string, ttl?: number): Promise<string> {
		try {
			const response = await axios.post(`${this.redisServiceUrl}/cache/set`, {
				key,
				value,
				ttl,
			});
			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	async getKey(key: string): Promise<string | null> {
		try {
			const response = await axios.get(`${this.redisServiceUrl}/cache/get/${key}`);
			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	async deleteKey(key: string): Promise<string> {
		try {
			const response = await axios.delete(`${this.redisServiceUrl}/cache/delete/${key}`);
			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	async checkKeyExists(key: string): Promise<boolean> {
		try {
			const response = await axios.get(`${this.redisServiceUrl}/cache/exists/${key}`);
			return response.data;
		} catch (error) {
			this.handleError(error);
		}
	}

	private handleError(error: any): never {
		if (error.response) {
			throw new HttpException(
				error.response.data.message || "Redis Service Error",
				error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
			);
		} else {
			throw new HttpException(
				"Failed to connect to Redis Service",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
