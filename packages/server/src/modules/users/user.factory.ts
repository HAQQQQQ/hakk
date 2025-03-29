// src/users/mappers/user.mapper.ts
import { Injectable } from "@nestjs/common";
import { User } from "./users.model";
import { CreateUserDto } from "./dtos/create-user.dto";
import { EntityFactory } from "@/common/models/entity.mapper.interface";
import { UserType } from "@hakk/types";

type UserConstructor = new (
	userId: string,
	firstName: string,
	lastName: string,
	email: string,
	dateOfBirth: Date,
	userType: UserType,
	gender: string, // adjust type as needed (e.g., Gender)
	middleName?: string,
	phoneNumber?: string,
	avatarUrl?: string,
) => User;

@Injectable()
export class UserFactory implements EntityFactory<CreateUserDto, User> {
	createEntity(dto: CreateUserDto): User {
		return new User(
			dto.userId,
			dto.firstName,
			dto.lastName,
			dto.email,
			new Date(dto.dateOfBirth),
			dto.userType,
			dto.gender, // assuming dto.gender is of type Gender
			dto.middleName,
			dto.phoneNumber,
			dto.avatarUrl,
		);
	}
}
