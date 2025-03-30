import { IDTOConvertible, UserInfoDto, UserType } from "@hakk/types";
import { Gender } from "@hakk/types";

export class UserInfo implements IDTOConvertible<UserInfoDto> {
	private readonly firstName: string;
	private readonly lastName: string;
	private readonly middleName?: string;
	private readonly email: string;
	private readonly dateOfBirth: Date;
	private readonly userType: UserType;
	private readonly phoneNumber?: string;
	private readonly gender: Gender;
	private readonly avatarUrl?: string;
	private readonly createdAt: Date;
	private readonly updatedAt: Date;

	constructor(
		firstName: string,
		lastName: string,
		email: string,
		dateOfBirth: Date,
		userType: UserType,
		gender: Gender,
		middleName?: string,
		phoneNumber?: string,
		avatarUrl?: string,
		createdAt?: Date,
		updatedAt?: Date,
	) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.middleName = middleName;
		this.email = email;
		this.dateOfBirth = dateOfBirth;
		this.userType = userType;
		this.phoneNumber = phoneNumber;
		this.gender = gender;
		this.avatarUrl = avatarUrl;
		this.createdAt = createdAt ?? new Date();
		this.updatedAt = updatedAt ?? new Date();
	}

	toDTO(): UserInfoDto {
		return {
			firstName: this.firstName,
			lastName: this.lastName,
			fullName: this.getFullName(),
			middleName: this.middleName,
			email: this.email,
			dateOfBirth: this.dateOfBirth.toISOString(),
			age: this.getAge(),
			userType: this.userType,
			phoneNumber: this.phoneNumber,
			gender: this.gender,
			avatarUrl: this.avatarUrl,
			createdAt: this.createdAt.toISOString(),
			updatedAt: this.updatedAt.toISOString(),
		};
	}

	getFullName(): string {
		if (this.middleName) {
			return `${this.firstName} ${this.middleName} ${this.lastName}`;
		}
		return `${this.firstName} ${this.lastName}`;
	}

	getAge(): number {
		if (!this.dateOfBirth) return 0;

		const today = new Date();
		const birthDate = new Date(this.dateOfBirth);

		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDifference = today.getMonth() - birthDate.getMonth();

		if (
			monthDifference < 0 ||
			(monthDifference === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	}

	isAdult(): boolean {
		return this.getAge() >= 18;
	}

	hasContactInfo(): boolean {
		return !!this.email || !!this.phoneNumber;
	}
}
