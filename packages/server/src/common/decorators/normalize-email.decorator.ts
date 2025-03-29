// src/common/decorators/normalized-email.decorator.ts
import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsEmail, Matches, IsOptional } from "class-validator";

export function NormalizedEmail(optional: boolean = false) {
	const decorators = [
		Transform(({ value }) => {
			if (typeof value === "string") {
				return value.trim().toLowerCase();
			}
			return value;
		}),
		IsEmail({}, { message: "Invalid email address" }),
		// This additional check ensures the string contains an "@" symbol
		Matches(/@/, { message: 'Email must contain "@" symbol' }),
	];

	if (optional) {
		decorators.push(IsOptional());
	}

	return applyDecorators(...decorators);
}
