from dotenv import load_dotenv
from flask import Flask, request, jsonify
from jsonschema import validate, ValidationError
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import faiss
import json
import os
from pathlib import Path

# Load from the root .env
ROOT_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ROOT_ENV_PATH)

# Get model from environment (with fallback)
MODEL_NAME = os.getenv("MATCHER_MODEL")
if not MODEL_NAME:
    MODEL_NAME = 'BAAI/bge-large-en'

print(f"📦 Loading language model: {MODEL_NAME}")
model = SentenceTransformer(MODEL_NAME)


# The weather is nice out today
# Its beautiful and sunny

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    print('In Python Api!')
    print(f"faiss_version: {faiss.__version__}")
    print(f"🔍 Currently using model: {MODEL_NAME}")
    return f"Matcher service is running using model: {MODEL_NAME}"


@app.route("/similarity", methods=["POST"])
def similarity():
    concept_pairs = request.get_json()

    if not concept_pairs:
        print("❌ No concept pairs received.")
        return jsonify({"error": "No data provided"}), 400

    total_pairs = len(concept_pairs)
    print(f"📦 Received {total_pairs} concept pairs for similarity computation.")

    results = []

    for i, pair in enumerate(concept_pairs):
        desc_a = pair["conceptA"]["description"]
        desc_b = pair["conceptB"]["description"]

        embeddings = model.encode([desc_a, desc_b])
        similarity_score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

        results.append({
            "conceptA_id": pair["conceptA"]["id"],
            "conceptB_id": pair["conceptB"]["id"],
            "similarity":  similarity_score.item()
        })

        print(f"🔍 Pair {i+1}: A={pair['conceptA']['name']} ↔ B={pair['conceptB']['name']} → Similarity={similarity_score:.8f}")

    print(f"✅ Completed processing {total_pairs} pairs.")
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, port=5000)