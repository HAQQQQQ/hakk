import { Injectable } from "@nestjs/common";

@Injectable()
export class MatchingService {
	constructor() {}

	/*
        Step1 - compute graph for all graph types

        Step2 - normalize distance for all graph types
        normalizedDistance = actualDistance / maxPossibleDistanceInGraph

        Step3 - Assign weights (importance to each graph type)
        const WEIGHTS = {
            music: 0.4,
            personality: 0.4,
            sports: 0.2,
        };

        Step4 - Compute score for 2 users
        - for each graph (Look Up normalizedDistance multiply by Weigh of graph)

        Step5 - Interpret final score
            Score   	Meaning
            0.85–1.0	Soulmates
            0.65–0.85	Strong match
            0.4–0.65	Compatible
            0.2–0.4	    Somewhat mismatched
            < 0.2   	Probably not a match



    --Notes--
        1) If the "maxPossibleDistanceInGraph" is the same for all graph types (which it should be). 
            Might be best to multiply weight by actual distance as im creating each graph

        2) Look into caching


    */
}
