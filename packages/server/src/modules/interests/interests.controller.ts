import { Controller, Get, InternalServerErrorException, Req } from '@nestjs/common';


export interface InterestResponseDto {
    id: number;
    name: string;
};

@Controller('interests')
export class InterestsController {
    private interests: InterestResponseDto[] = [
        { id: 1, name: 'Fitness' },
        { id: 2, name: 'Music' },
    ];

    @Get()
    getAllInterests(): InterestResponseDto[] {
        return this.interests;
    }

    // ❌ Simulated "Internal Server Error"
    @Get('server-error')
    triggerServerError(): void {
        throw new InternalServerErrorException('Simulated internal error for testing.');
    }
}
