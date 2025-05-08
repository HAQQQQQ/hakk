# blueprints/matcher_blueprint.py
from flask import Blueprint, request, jsonify
from services.matcher_service import MatcherService
import faiss

# Create blueprint
matcher_bp = Blueprint('matcher', __name__)

# Initialize matcher service
matcher_service = MatcherService()

@matcher_bp.route('/', methods=['GET'])
def index():
    print('In Python Api!')
    print(f"faiss_version: {faiss.__version__}")
    print(f"🔍 Currently using model: {matcher_service.get_model_info()}")
    return f"Matcher service is running using model: {matcher_service.get_model_info()}"

@matcher_bp.route('/similarity', methods=['POST'])
def similarity():
    concept_pairs = request.get_json()
    
    if not concept_pairs:
        print("❌ No concept pairs received.")
        return jsonify({"error": "No data provided"}), 400
    
    results = matcher_service.process_concept_pairs(concept_pairs)
    
    if "error" in results:
        return jsonify(results), 400
    
    return jsonify(results)

@matcher_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": matcher_service.get_model_info(),
        "faiss_version": faiss.__version__
    })