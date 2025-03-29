// src/users/dto/create-user.dto.ts
import { NormalizedEmail } from "@/common/decorators/normalize-email.decorator";
import { NormalizedPhoneNumber } from "@/common/decorators/normalize-phone-number.decorator";
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from "class-validator";
import { CreateUserRequest, Gender, UserType } from "@hakk/types";

export class CreateUserDto implements CreateUserRequest {
	@IsNotEmpty()
	@IsString()
	userId: string;

	@IsNotEmpty()
	@IsString()
	firstName: string;

	@IsNotEmpty()
	@IsString()
	lastName: string;

	@IsOptional()
	@IsString()
	middleName?: string;

	@IsNotEmpty()
	@NormalizedEmail() // Trims, lowercases, ensures valid email format, and contains '@'
	email: string;

	@IsNotEmpty()
	@IsDateString()
	dateOfBirth: string;

	@IsOptional()
	@NormalizedPhoneNumber(true) // Normalizes phone number and validates against E.164 format; optional field
	phoneNumber?: string;

	@IsEnum(Gender, { message: "Gender must be either male, female, or other" })
	gender: Gender;

	@IsOptional()
	avatarUrl?: string;

	@IsNotEmpty()
	@IsEnum(UserType, {
		message: "UserType must be either admin, standard, guest, or event coordinator",
	})
	userType: UserType;
}
