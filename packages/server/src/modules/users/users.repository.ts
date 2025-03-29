import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "./users.model";
import { Gender } from "@hakk/types";

@Injectable()
export class UsersRepository {
	private readonly USERS_TABLE: string = "users";

	constructor(private readonly supabaseService: SupabaseService) {}

	async fetchById(id: string): Promise<User> {
		const { data, error } = await this.supabaseService.client
			.from(this.USERS_TABLE)
			.select("*")
			.eq("user_id", id)
			.single();

		if (error) {
			throw error;
		}

		return this.mapToEntity(data);
	}

	async insertUser(newUser: User): Promise<User> {
		try {
			// Prepare user data for insertion
			const userData = {
				first_name: newUser.firstName,
				last_name: newUser.lastName,
				middle_name: newUser.middleName,
				email: newUser.email,
				date_of_birth: newUser.dateOfBirth,
				user_type: newUser.userType,
				phone_number: newUser.phoneNumber,
				gender: newUser.gender,
				user_id: newUser.userId,
				avatar_url: newUser.avatarUrl,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const { data, error } = await this.supabaseService.client
				.from(this.USERS_TABLE)
				.insert(userData)
				.select()
				.single();

			if (error) {
				// Check for common errors
				if (error.code === "23505") {
					throw new InternalServerErrorException("User with this email already exists");
				}
				throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
			}

			// Map the created record to a User entity
			return this.mapToEntity(data);
		} catch (error) {
			if (error instanceof InternalServerErrorException) {
				throw error;
			}

			console.error("Error inserting user:", error);
			throw new InternalServerErrorException(
				"An unexpected error occurred while creating the user",
			);
		}
	}

	private mapToEntity(data: any): User {
		const mapGender = (genderString: string): Gender => {
			if (genderString?.toUpperCase() === "MALE") {
				return Gender.MALE;
			} else if (genderString?.toUpperCase() === "FEMALE") {
				return Gender.FEMALE;
			} else {
				console.warn(`Unknown gender value: ${genderString}`);
				return Gender.MALE;
			}
		};

		return new User(
			data.user_id,
			data.first_name,
			data.last_name,
			data.email,
			new Date(data.date_of_birth),
			data.user_type,
			mapGender(data.gender),
			data.middle_name,
			data.phone_number,
			data.avatar_url,
			data.created_at ? new Date(data.created_at) : undefined,
			data.updated_at ? new Date(data.updated_at) : undefined,
		);
	}
}
