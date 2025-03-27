from flask import Flask, request, jsonify
import faiss


app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    print('In Python Api!')
    print(f"faiss_version: {faiss.__version__}")
    return "Matcher service is running!"

@app.route('/match', methods=['GET'])
def get_match_score():
    # Grab query parameters
    user_a = request.args.get('userA')
    user_b = request.args.get('userB')

    # Check if both parameters were provided
    if not user_a or not user_b:
        return jsonify({'error': 'Missing userA or userB'}), 400

    # For now, just return a dummy match score
    match_score = 0.85  # You would replace this with your actual logic

    return jsonify({
        'userA': user_a,
        'userB': user_b,
        'matchScore': match_score
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
