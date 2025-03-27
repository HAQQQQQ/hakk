// scripts/export-schemas.ts
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs";
import path from "path";
import { MatchSchema } from "@hakk/types";

// Convert Zod schema to JSON schema
const matchSchema = zodToJsonSchema(MatchSchema, "Match");

// Output path
const outputPath = path.join(process.cwd(), "packages/types/src/matchingapi/match.schema.json");

// Check if directory exists
if (!fs.existsSync(path.dirname(outputPath))) {
	throw new Error(`Directory does not exist: ${path.dirname(outputPath)}`);
}

// Write or overwrite the file
fs.writeFileSync(outputPath, JSON.stringify(matchSchema, null, 2));
