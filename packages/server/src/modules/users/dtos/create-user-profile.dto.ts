import {
	Gender,
	RelationshipStatus,
	RelationshipGoal,
	FrequencyHabit,
	Education,
	Religion,
	CreateUserProfileRequest,
} from "@hakk/types";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsEnum,
	MinLength,
	MaxLength,
	IsNumber,
	Min,
	Max,
	IsBoolean,
	IsArray,
	IsUrl,
	ArrayMinSize,
} from "class-validator";

export class CreateUserProfileDto implements CreateUserProfileRequest {
	@IsNotEmpty()
	@IsString()
	userId: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	displayName: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	aboutMe: string;

	@IsOptional()
	@IsString()
	location: string;

	@IsOptional()
	@IsNumber()
	height: number; // in inches

	@IsOptional()
	@IsString()
	occupation: string;

	@IsNotEmpty()
	@IsEnum(RelationshipStatus)
	relationshipStatus: RelationshipStatus;

	@IsNotEmpty()
	@IsEnum(RelationshipGoal)
	lookingFor: RelationshipGoal;

	@IsNotEmpty()
	@IsArray()
	@IsEnum(Gender, { each: true })
	@ArrayMinSize(1)
	interestedIn: Gender[];

	@IsOptional()
	@IsBoolean()
	hasChildren: boolean;

	@IsOptional()
	@IsBoolean()
	wantsChildren: boolean;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	interests: string[];

	@IsNotEmpty()
	@IsArray()
	@IsUrl({}, { each: true })
	@MaxLength(10)
	photos: string[];

	@IsOptional()
	@IsEnum(Education)
	educationLevel: Education;

	@IsOptional()
	@IsEnum(FrequencyHabit)
	drinkingHabit: FrequencyHabit;

	@IsOptional()
	@IsEnum(FrequencyHabit)
	smokingHabit: FrequencyHabit;

	@IsOptional()
	@IsEnum(Religion)
	religion: Religion;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	languages: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	maxDistance: number; // in km
}
