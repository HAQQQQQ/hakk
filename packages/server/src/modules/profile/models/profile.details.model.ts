import {
	AgeRange,
	Distance,
	Education,
	FrequencyHabit,
	Gender,
	Height,
	IDTOConvertible,
	Photo,
	RelationshipGoal,
	RelationshipStatus,
	Religion,
	UserAdditionalDetailsDto,
} from "@hakk/types";

export class AdditionalDetails implements IDTOConvertible<UserAdditionalDetailsDto> {
	// Required fields
	readonly displayName: string;
	readonly aboutMe: string;
	readonly relationshipStatus: RelationshipStatus;
	readonly lookingFor: RelationshipGoal;
	readonly interestedIn: Gender[];
	readonly photos: Photo[];
	readonly ageRange: AgeRange;

	// Optional fields
	readonly location?: string;
	readonly height?: Height;
	readonly occupation?: string;
	readonly hasChildren?: boolean;
	readonly wantsChildren?: boolean;
	// readonly interests?: string[];
	readonly educationLevel?: Education;
	readonly drinkingHabit?: FrequencyHabit;
	readonly smokingHabit?: FrequencyHabit;
	readonly religion?: Religion;
	readonly languages?: string;
	readonly maxDistance?: Distance;

	constructor(
		displayName: string,
		aboutMe: string,
		relationshipStatus: RelationshipStatus,
		lookingFor: RelationshipGoal,
		interestedIn: Gender[],
		photos: Photo[],
		ageRange: AgeRange,
		location?: string,
		height?: Height,
		occupation?: string,
		hasChildren?: boolean,
		wantsChildren?: boolean,
		educationLevel?: Education,
		drinkingHabit?: FrequencyHabit,
		smokingHabit?: FrequencyHabit,
		religion?: Religion,
		languages?: string,
		maxDistance?: Distance,
	) {
		this.displayName = displayName;
		this.aboutMe = aboutMe;
		this.relationshipStatus = relationshipStatus;
		this.lookingFor = lookingFor;
		this.interestedIn = interestedIn;
		this.photos = photos;
		this.ageRange = ageRange;
		this.location = location;
		this.height = height;
		this.occupation = occupation;
		this.hasChildren = hasChildren;
		this.wantsChildren = wantsChildren;
		this.educationLevel = educationLevel;
		this.drinkingHabit = drinkingHabit;
		this.smokingHabit = smokingHabit;
		this.religion = religion;
		this.languages = languages;
		this.maxDistance = maxDistance;
	}

	toDTO(): UserAdditionalDetailsDto {
		return {
			displayName: this.displayName,
			aboutMe: this.aboutMe,
			relationshipStatus: this.relationshipStatus,
			lookingFor: this.lookingFor,
			interestedIn: this.interestedIn,
			photos: this.photos,
			ageRange: this.ageRange,
			location: this.location,
			height: this.height,
			occupation: this.occupation,
			hasChildren: this.hasChildren,
			wantsChildren: this.wantsChildren,
			// interests: this.interests,
			educationLevel: this.educationLevel,
			drinkingHabit: this.drinkingHabit,
			smokingHabit: this.smokingHabit,
			religion: this.religion,
			languages: this.languages,
			maxDistance: this.maxDistance,
		};
	}
}
