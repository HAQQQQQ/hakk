from flask import Flask, request, jsonify
from jsonschema import validate, ValidationError
import faiss
import json
import os


app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    print('In Python Api!')
    print(f"faiss_version: {faiss.__version__}")
    return "Matcher service is running!"

# @app.route("/match", methods=["POST"])
# def get_match_score():
#     # Grab query parameters
#     user_a = request.args.get('userA')
#     user_b = request.args.get('userB')

#     # Check if both parameters were provided
#     if not user_a or not user_b:
#         return jsonify({'error': 'Missing userA or userB'}), 400

#     # For now, just return a dummy match score
#     match_score = 0.85  # You would replace this with your actual logic

#     return jsonify({
#         'userA': user_a,
#         'userB': user_b,
#         'matchScore': match_score
#     })
# with open("shared-schemas/match.schema.json") as f:
#     match_schema = json.load(f)

schema_path = os.path.join(os.path.dirname(__file__), "..", "types", "src", "matchingapi", "match.schema.json")
with open(schema_path) as f:
    match_schema = json.load(f)

@app.route("/match", methods=["POST"])
def match():
    try:
        data = request.get_json()
        validate(instance=data, schema=match_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    # If valid
    return jsonify({"matchScore": 0.97})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
