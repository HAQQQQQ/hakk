export type Preference = {
	music: string[];
	movie: string[];
	hobby: string[];
};

export type Events = {
	name: string;
};

export enum Gender {
	MALE = "Male",
	FEMALE = "Female",
}

export enum UserType {
	ADMIN = "Admin",
	REGULAR = "Regular",
	GUEST = "Guest",
	EVENT_COORDINATOR = "Event Coordinator",
}

export enum RelationshipStatus {
	SINGLE = "Single",
	DIVORCED = "Divorced",
	SEPARATED = "Separated",
	WIDOWED = "Widowed",
}

export enum RelationshipGoal {
	CASUAL = "Casual",
	DATING = "Dating",
	RELATIONSHIP = "Relationship",
	MARRIAGE = "Marriage",
}

export enum FrequencyHabit {
	NEVER = "never",
	RARELY = "rarely",
	SOCIALLY = "socially",
	REGULARLY = "regularly",
	HEAVILY = "heavily",
	PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum Religion {
	CHRISTIANITY = "christianity",
	CATHOLICISM = "catholicism",
	JUDAISM = "judaism",
	ISLAM = "islam",
	HINDUISM = "hinduism",
	BUDDHISM = "buddhism",
	SIKHISM = "sikhism",
	ATHEIST = "atheist",
	AGNOSTIC = "agnostic",
	SPIRITUAL = "spiritual",
	OTHER = "other",
	PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum Education {
	HIGH_SCHOOL = "high_school",
	SOME_COLLEGE = "some_college",
	ASSOCIATES_DEGREE = "associates_degree",
	BACHELORS_DEGREE = "bachelors_degree",
	MASTERS_DEGREE = "masters_degree",
	DOCTORATE = "doctorate",
	PROFESSIONAL_DEGREE = "professional_degree",
	TRADE_SCHOOL = "trade_school",
	OTHER = "other",
	PREFER_NOT_TO_SAY = "prefer_not_to_say",
}
