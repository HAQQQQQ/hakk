import { UserType } from "../../models";

export interface UserDto {
	userId: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	fullName: string;
	email: string;
	dateOfBirth: string; // ISO format date string for API transport
	age: number;
	phoneNumber?: string;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	gender: string;
	avatarUrl?: string;
	userType: UserType;
}
