# services/matcher_service.py
import os
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class MatcherService:
    def __init__(self, model_name=None):
        if not model_name:
            model_name = os.getenv("MATCHER_MODEL", 'BAAI/bge-large-en')
        
        print(f"📦 Loading language model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
    
    def compute_similarity(self, text_a, text_b):
        """Compute cosine similarity between two texts"""
        embeddings = self.model.encode([text_a, text_b])
        similarity_score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return similarity_score.item()
    
    def process_concept_pairs(self, concept_pairs):
        """Process multiple concept pairs and return similarity scores"""
        if not concept_pairs:
            return {"error": "No data provided"}
        
        total_pairs = len(concept_pairs)
        print(f"📦 Received {total_pairs} concept pairs for similarity computation.")
        
        results = []
        
        for i, pair in enumerate(concept_pairs):
            desc_a = pair["conceptA"]["description"]
            desc_b = pair["conceptB"]["description"]
            
            similarity_score = self.compute_similarity(desc_a, desc_b)
            
            results.append({
                "conceptA_id": pair["conceptA"]["id"],
                "conceptB_id": pair["conceptB"]["id"],
                "similarity": similarity_score
            })
            
            print(f"🔍 Pair {i+1}: A={pair['conceptA']['name']} ↔ B={pair['conceptB']['name']} → Similarity={similarity_score:.8f}")
        
        print(f"✅ Completed processing {total_pairs} pairs.")
        return results
    
    def get_model_info(self):
        """Return model information"""
        return self.model_name