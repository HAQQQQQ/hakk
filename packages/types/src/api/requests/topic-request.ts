export interface BaseConcept {
	name: string;
	description: string;
}

export interface NewTopicRequest {
	name: string;
	concepts: BaseConcept[];
}
