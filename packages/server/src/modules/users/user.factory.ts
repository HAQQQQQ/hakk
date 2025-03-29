// src/users/mappers/user.mapper.ts
import { Injectable } from "@nestjs/common";
import { User } from "./users.model";
import { CreateUserDto } from "./create-user.dto";
import { EntityFactory } from "@/common/models/entity.mapper.interface";

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
