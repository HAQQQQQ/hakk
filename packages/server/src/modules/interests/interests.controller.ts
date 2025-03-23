import { Controller } from "@nestjs/common";
import { InterestsService } from "./interests.service";

export interface InterestResponseDto {
    id: number;
    name: string;
}

@Controller("interests")
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) { }
}
