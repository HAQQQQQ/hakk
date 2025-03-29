import { Gender, UserType } from "../../models";

export interface CreateUserRequest {
	userId: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	dateOfBirth: string;
	phoneNumber?: string;
	gender: Gender;
	avatarUrl?: string;
	userType: UserType;
}
