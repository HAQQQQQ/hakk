// src/modules/openai/repository/openai-config.repository.ts
import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "@/modules/supabase/supabase.service";
import { OpenAIConfigSettings, OpenAIModel } from "./openai.types";
import { OpenAIConfig } from "./openai.config";

interface OpenAIConfigRecord {
	id: string;
	model: OpenAIModel;
	temperature: number;
	max_retries: number;
	retry_delay: number;
	system_message: string;
	created_at?: string;
	updated_at?: string;
}

@Injectable()
export class OpenAIConfigRepository {
	private readonly logger = new Logger(OpenAIConfigRepository.name);
	private readonly TABLE_NAME = "openai_configurations";

	constructor(private readonly supabase: SupabaseService) {}

	/**
	 * Fetch the current OpenAI configuration from the database
	 * @returns Configuration settings or null if none exists
	 */
	async getConfig(): Promise<OpenAIConfigSettings | null> {
		try {
			const { data, error } = await this.supabase.client
				.from(this.TABLE_NAME)
				.select("*")
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					// No rows returned
					this.logger.debug("No OpenAI configuration found in database");
					return null;
				}
				throw new Error(`Error fetching OpenAI configuration: ${error.message}`);
			}

			if (!data) {
				return null;
			}

			// Map from database record to configuration settings
			return this.mapToConfigSettings(data);
		} catch (error) {
			this.logger.error(`Failed to get OpenAI configuration: ${error.message}`);
			return null;
		}
	}

	/**
	 * Save configuration to the database
	 * @param config Configuration to save
	 * @returns The saved configuration
	 */
	async saveConfig(config: OpenAIConfigSettings): Promise<OpenAIConfigSettings> {
		try {
			// Check if a configuration already exists
			const { data: existingConfig } = await this.supabase.client
				.from(this.TABLE_NAME)
				.select("id")
				.limit(1)
				.single();

			// Prepare data for insertion/update
			const configData = {
				model: config.model,
				temperature: config.temperature,
				max_retries: config.maxRetries,
				retry_delay: config.retryDelay,
				system_message: config.systemMessage,
				// updated_at: new Date().toISOString(),
			};

			let savedRecord: OpenAIConfigRecord;

			if (existingConfig) {
				// Update existing record
				const { data, error } = await this.supabase.client
					.from(this.TABLE_NAME)
					.update(configData)
					.eq("id", existingConfig.id)
					.select("*")
					.single();

				if (error) {
					throw new Error(`Error updating OpenAI configuration: ${error.message}`);
				}

				this.logger.debug(`Updated OpenAI configuration with ID: ${existingConfig.id}`);
				savedRecord = data;
			} else {
				// Insert new record
				const { data, error } = await this.supabase.client
					.from(this.TABLE_NAME)
					.insert({
						...configData,
						created_at: new Date().toISOString(),
					})
					.select("*")
					.single();

				if (error) {
					throw new Error(`Error inserting OpenAI configuration: ${error.message}`);
				}

				this.logger.debug(`Created new OpenAI configuration with ID: ${data.id}`);
				savedRecord = data;
			}

			return this.mapToConfigSettings(savedRecord);
		} catch (error) {
			this.logger.error(`Failed to save OpenAI configuration: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Reset the configuration to system defaults
	 * @returns The reset configuration
	 */
	async resetToDefaults(): Promise<OpenAIConfigSettings> {
		try {
			// Get defaults from OpenAIConfig
			const defaults = OpenAIConfig.getDefaults();

			// Save defaults to database
			return await this.saveConfig(defaults);
		} catch (error) {
			this.logger.error(`Failed to reset OpenAI configuration: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Map from database record to configuration settings
	 */
	private mapToConfigSettings(record: OpenAIConfigRecord): OpenAIConfigSettings {
		return {
			model: record.model,
			temperature: record.temperature,
			maxRetries: record.max_retries,
			retryDelay: record.retry_delay,
			systemMessage: record.system_message,
		};
	}
}
