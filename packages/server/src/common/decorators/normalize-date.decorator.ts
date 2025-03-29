// src/common/decorators/normalized-date.decorator.ts
import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsDateString } from "class-validator";
import dayjs from "dayjs";

export function NormalizedDate() {
	return applyDecorators(
		Transform(({ value }) => {
			if (!value) return value;
			const date = dayjs(value);
			return date.isValid() ? date.toISOString() : value;
		}),
		IsDateString(),
	);
}
