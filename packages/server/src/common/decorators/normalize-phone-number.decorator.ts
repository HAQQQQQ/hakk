// src/common/decorators/normalized-phone-number.decorator.ts
import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { Matches, IsOptional } from "class-validator";

export function NormalizedPhoneNumber(optional: boolean = false) {
	const decorators = [
		Transform(({ value }) => {
			if (typeof value === "string") {
				// Remove common non-numeric characters except the leading '+' if it exists
				return value.replace(/(?!^\+)[^0-9]/g, "");
			}
			return value;
		}),
		Matches(/^\+?[1-9]\d{1,14}$/, {
			message: "Phone number must be in valid E.164 format",
		}),
	];

	if (optional) {
		decorators.push(IsOptional());
	}

	return applyDecorators(...decorators);
}
