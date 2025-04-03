import axios from "axios";
import { config } from "dotenv";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

config(); // Load .env

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function createEmbedding(text: string): Promise<number[]> {
	const response = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: text,
	});

	return response.data[0].embedding;
}

async function saveToSupabase(name: string, vector: number[]) {
	const { error } = await supabase.from("sampleai").insert([{ name, vector }]);

	if (error) throw error;
}

async function main() {
	const response = await axios.get("https://digimon-api.vercel.app/api/digimon");
	const digimons = response.data;

	// for (const digimon of digimons) {
	// 	const text = `${digimon.name} - ${digimon.level}`;
	// 	const embedding = await createEmbedding(text);
	//
	// 	console.log(`Saving ${digimon.name}...`);
	// 	await saveToSupabase(digimon.name, embedding);
	// }

	const cosine_sim = await compareDigimonSimilarity("Agumon", "Gabumon");
	console.log(cosine_sim);

	console.log("✅ All embeddings saved!");
}

async function getEmbeddingByName(name: string): Promise<number[]> {
	const { data, error } = await supabase
		.from("sampleai")
		.select("vector")
		.eq("name", name)
		.single();

	if (error || !data) {
		throw new Error(`Digimon "${name}" not found or error occurred.`);
	}

	// ✅ Ensure it's parsed into an array
	let vector = data.vector;
	if (typeof vector === "string") {
		vector = JSON.parse(vector); // handles '[0.1, 0.2, ...]'
	}

	if (!Array.isArray(vector)) {
		throw new Error(`Invalid vector format for "${name}": ${typeof vector}`);
	}

	return data.vector;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
	const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

async function compareDigimonSimilarity(name1: string, name2: string): Promise<void> {
	const vec1 = await getEmbeddingByName(name1);
	const vec2 = await getEmbeddingByName(name2);

	const similarity = cosineSimilarity(vec1, vec2);
	console.log(`Cosine similarity between "${name1}" and "${name2}": ${similarity.toFixed(4)}`);
}

main().catch((err) => {
	console.error("❌ Script failed:", err);
	process.exit(1);
});
