import {
	AgeRange,
	Distance,
	Education,
	FrequencyHabit,
	Gender,
	IDTOConvertible,
	PartnerChildrenPreference,
	RelationshipGoal,
	Religion,
	UserPreferencesDto,
} from "@hakk/types";

export class UserPreferences implements IDTOConvertible<UserPreferencesDto> {
	private readonly preferredAgeRange: AgeRange;
	private readonly preferredGenders: Gender[];

	// Relationship Preferences
	private readonly desiredRelationshipTypes: RelationshipGoal[];

	// Lifestyle Preferences
	private readonly preferredEducationLevels?: Education[];
	private readonly preferredOccupations?: string[];

	// Family Preferences
	private readonly partnerHasChildrenPreference?: PartnerChildrenPreference;

	// Habits Preferences
	private readonly drinkingHabitPreference?: FrequencyHabit;
	private readonly smokingHabitPreference?: FrequencyHabit;

	private readonly maxDistance?: Distance;
	private readonly preferredLocations?: string[];

	// Additional Preferences
	private readonly preferredLanguages?: string[];
	private readonly preferredReligions?: Religion[];

	constructor(
		preferredAgeRange: AgeRange,
		preferredGenders: Gender[],
		desiredRelationshipTypes: RelationshipGoal[],
		preferredEducationLevels?: Education[],
		preferredOccupations?: string[],
		partnerHasChildrenPreference?: PartnerChildrenPreference,
		drinkingHabitPreference?: FrequencyHabit,
		smokingHabitPreference?: FrequencyHabit,
		maxDistance?: Distance,
		preferredLocations?: string[],
		preferredLanguages?: string[],
		preferredReligions?: Religion[],
	) {
		this.preferredAgeRange = preferredAgeRange;
		this.preferredGenders = preferredGenders;
		this.desiredRelationshipTypes = desiredRelationshipTypes;
		this.preferredEducationLevels = preferredEducationLevels;
		this.preferredOccupations = preferredOccupations;
		this.partnerHasChildrenPreference = partnerHasChildrenPreference;
		this.drinkingHabitPreference = drinkingHabitPreference;
		this.smokingHabitPreference = smokingHabitPreference;
		this.maxDistance = maxDistance;
		this.preferredLocations = preferredLocations;
		this.preferredLanguages = preferredLanguages;
		this.preferredReligions = preferredReligions;
	}

	toDTO(): UserPreferencesDto {
		return {
			preferredAgeRange: this.preferredAgeRange,
			preferredGenders: this.preferredGenders,
			desiredRelationshipTypes: this.desiredRelationshipTypes,
			preferredEducationLevels: this.preferredEducationLevels,
			preferredOccupations: this.preferredOccupations,
			partnerHasChildrenPreference: this.partnerHasChildrenPreference,
			drinkingHabitPreference: this.drinkingHabitPreference,
			smokingHabitPreference: this.smokingHabitPreference,
			maxDistance: this.maxDistance,
			preferredLocations: this.preferredLocations,
			preferredLanguages: this.preferredLanguages,
			preferredReligions: this.preferredReligions,
		};
	}
}
