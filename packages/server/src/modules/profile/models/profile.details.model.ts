import {
	Education,
	FrequencyHabit,
	Height,
	IDTOConvertible,
	Photo,
	RelationshipStatus,
	Religion,
	UserAdditionalDetailsDto,
} from "@hakk/types";

export class AdditionalDetails implements IDTOConvertible<UserAdditionalDetailsDto> {
	private readonly displayName: string; // maps to display_name, required
	private readonly aboutMe: string; // maps to about_me
	private readonly photos: Photo[];

	// Optional fields
	private readonly relationshipStatus?: RelationshipStatus;
	private readonly occupation?: string;
	private readonly educationLevel?: Education;
	private readonly languages?: string[];
	private readonly religion?: Religion;
	private readonly hasChildren?: boolean;
	private readonly wantsChildren?: boolean;
	private readonly drinkingHabit?: FrequencyHabit;
	private readonly smokingHabit?: FrequencyHabit;
	private readonly height?: Height;
	private readonly location?: string;

	constructor(
		displayName: string, // maps to display_name, required
		aboutMe: string, // maps to about_me
		photos: Photo[],

		// Optional fields
		relationshipStatus?: RelationshipStatus,
		occupation?: string,
		educationLevel?: Education,
		languages?: string[],
		religion?: Religion,
		hasChildren?: boolean,
		wantsChildren?: boolean,
		drinkingHabit?: FrequencyHabit,
		smokingHabit?: FrequencyHabit,
		height?: Height,
		location?: string,
	) {
		this.displayName = displayName;
		this.aboutMe = aboutMe;
		this.photos = photos;
		this.relationshipStatus = relationshipStatus;
		this.occupation = occupation;
		this.educationLevel = educationLevel;
		this.languages = languages;
		this.religion = religion;
		this.hasChildren = hasChildren;
		this.wantsChildren = wantsChildren;
		this.drinkingHabit = drinkingHabit;
		this.smokingHabit = smokingHabit;
		this.height = height;
		this.location = location;
	}

	toDTO(): UserAdditionalDetailsDto {
		return {
			displayName: this.displayName,
			aboutMe: this.aboutMe,
			photos: this.photos,

			// Optional fields
			relationshipStatus: this.relationshipStatus,
			occupation: this.occupation,
			educationLevel: this.educationLevel,
			languages: this.languages,
			religion: this.religion,
			hasChildren: this.hasChildren,
			wantsChildren: this.wantsChildren,
			drinkingHabit: this.drinkingHabit,
			smokingHabit: this.smokingHabit,
			height: this.height,
			location: this.location,
		};
	}
}
