export type Preference = {
	music: string[];
	movie: string[];
	hobby: string[];
};

export type Events = {
	name: string;
};

export enum Gender {
	MALE = "MALE",
	FEMALE = "FEMALE",
}

export enum UserType {
	ADMIN = "ADMIN",
	STANDARD = "STANDARD",
	GUEST = "GUEST",
	EVENT_COORDINATOR = "EVENT_COORDINATOR",
}
