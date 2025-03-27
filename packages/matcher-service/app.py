from flask import Flask, request, jsonify
from jsonschema import validate, ValidationError
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import faiss
import json
import os

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    print('In Python Api!')
    print(f"faiss_version: {faiss.__version__}")
    return "Matcher service is running!"


# model = SentenceTransformer('all-MiniLM-L6-v2')
# model = SentenceTransformer('all-mpnet-base-v2')
model = SentenceTransformer('BAAI/bge-large-en')

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
 

# music_genres = {
#     "Pop": "Pop music is characterized by catchy melodies, simple choruses, and wide mainstream appeal. It's often upbeat and designed for radio play, blending elements from many other genres.",
#     "Rock": "Rock music is built on strong rhythms and electric guitars. It ranges from soft ballads to heavy, aggressive sounds, and often emphasizes raw energy and rebellion.",
#     "Hip Hop": "Hip hop features rhythmic beats, spoken-word lyrics (rap), and elements like DJing and sampling. It often explores themes of identity, struggle, and culture.",
#     "R&B": "Rhythm and Blues blends soulful vocals with smooth beats. It originated from African American communities and often centers around love, relationships, and emotion.",
#     "Electronic": "Electronic music is made primarily with synthesizers, drum machines, and digital instruments. It spans from ambient textures to high-energy dance music.",
#     "Country": "Country music often features acoustic instruments and storytelling lyrics. Its themes usually involve love, heartbreak, rural life, and Americana.",
#     "Jazz": "Jazz is known for its improvisation, complex harmonies, and swing rhythms. It emerged from African American communities and has deep roots in blues and ragtime.",
#     "Classical": "Classical music refers to a broad tradition of orchestral and instrumental works, often composed between the 17th and 19th centuries. It emphasizes structure, harmony, and expression.",
#     "Reggae": "Reggae is a Jamaican genre with off-beat rhythms and laid-back grooves. It often includes themes of resistance, unity, and spirituality.",
#     "Metal": "Metal music is intense, powerful, and often aggressive. It features distorted guitars, fast drumming, and themes ranging from personal struggle to fantasy and darkness.",
#     "Alternative": "Alternative music emerged as a non-mainstream form of rock, often blending genres and experimenting with sound. It typically reflects introspective or socially conscious themes.",
#     "Indie Rock": "Indie rock is a subgenre of alternative rock made by independent artists or labels. It values authenticity, creativity, and often has a lo-fi, raw sound.",
#     "Funk": "Funk is driven by groovy basslines, syncopated rhythms, and soulful vocals. It emphasizes rhythm over melody and is rooted in African American musical traditions.",
#     "Soul": "Soul music combines gospel, R&B, and jazz elements to express deep emotion. It often features powerful vocals and themes of love, struggle, and hope.",
#     "Blues": "Blues is a foundational American genre with roots in African American history. It's known for its melancholic melodies, lyrical storytelling, and emotional depth.",
#     "Disco": "Disco is upbeat, danceable music with lush orchestration and a steady 4/4 beat. It dominated the 1970s nightclub scene and emphasizes rhythm and glamour.",
#     "House": "House music is a subgenre of electronic dance music with repetitive beats, synths, and grooves. Originating in Chicago, it's built for club and rave settings.",
#     "Techno": "Techno is a high-tempo, mechanical-sounding form of electronic music. It's characterized by driving beats and futuristic sounds, popular in underground scenes.",
#     "Trance": "Trance is a melodic and hypnotic form of EDM with soaring synths and long build-ups. It aims to create a euphoric, immersive listening experience.",
#     "Drum and Bass": "Drum and bass is fast-paced electronic music with rapid breakbeats and heavy basslines. It’s energetic and often experimental in rhythm and structure.",
#     "Dubstep": "Dubstep is a bass-heavy genre of electronic music characterized by syncopated rhythms and wobbly, distorted bass drops. It often has dark, futuristic vibes.",
#     "Trap": "Trap music features aggressive beats, hi-hat rolls, and lyrical themes centered around urban life and hustle. It’s a subgenre of hip hop that’s exploded in popularity.",
#     "K-Pop": "K-pop is Korean pop music that blends catchy hooks with choreographed visuals and diverse genres. It's known for high production value and global fandoms.",
#     "J-Pop": "J-pop is Japanese pop music, known for its polished production, upbeat melodies, and strong influence from anime and idol culture.",
#     "Latin Pop": "Latin pop combines catchy melodies with rhythms from Latin America, like salsa, reggaeton, and bachata. It’s energetic and often dance-oriented.",
#     "Reggaeton": "Reggaeton blends Latin rhythms with hip hop and dancehall elements. It features dembow beats, Spanish lyrics, and is hugely popular in global club scenes.",
#     "Dancehall": "Dancehall is a Jamaican genre with upbeat, rhythmic beats and toasting (spoken lyrics). It's raw, vibrant, and closely tied to party culture.",
#     "Afrobeats": "Afrobeats is a modern African genre that mixes traditional African music with hip hop, dancehall, and pop. It’s rhythm-heavy, melodic, and globally influential.",
#     "Salsa": "Salsa is a lively Latin genre with Afro-Cuban roots, known for vibrant brass, fast rhythms, and danceable beats. It's heavily associated with social dancing.",
#     "Bachata": "Bachata is a romantic music genre from the Dominican Republic. It features heartfelt lyrics, guitar-based instrumentation, and a gentle, syncopated rhythm.",
#     "Merengue": "Merengue is a fast-paced dance music from the Dominican Republic, driven by accordion and percussion. It’s festive and often performed in duets.",
#     "Cumbia": "Cumbia is a traditional Colombian dance music with a steady beat, percussion, and folkloric melodies. It has evolved into a pop-friendly Latin fusion style.",
#     "Tango": "Tango is an Argentine genre known for dramatic melodies and passionate rhythm. It combines European and African influences and is often performed with dance.",
#     "Folk": "Folk music is rooted in traditional storytelling and acoustic instrumentation. It emphasizes lyrical narratives, often reflecting cultural or political themes.",
#     "Bluegrass": "Bluegrass is a fast-paced, acoustic-driven genre with roots in American folk and country. It often features banjo, fiddle, and tight vocal harmonies.",
#     "Americana": "Americana blends elements of folk, country, blues, and rock. It focuses on lyrical storytelling and evokes a rustic, rootsy sound.",
#     "Gospel": "Gospel is a spiritual genre with Christian themes, powerful vocals, and uplifting messages. It evolved from church music and influences many other genres.",
#     "New Age": "New Age music is ambient and meditative, often instrumental and designed to promote relaxation or spirituality. It uses nature sounds and soft synths.",
#     "Ambient": "Ambient is an atmospheric genre that prioritizes tone and mood over rhythm. It’s slow, immersive, and used for background or introspective listening.",
#     "Lo-fi": "Lo-fi is a genre defined by its raw, unpolished sound, often with nostalgic vibes and ambient textures. It’s popular for studying or relaxing.",
#     "Grunge": "Grunge emerged in the '90s with distorted guitars, angst-filled lyrics, and a raw aesthetic. It blends punk attitude with heavy rock influences.",
#     "Punk": "Punk is fast, aggressive rock with anti-establishment lyrics and DIY energy. It emphasizes rebellion and raw simplicity over polish.",
#     "Emo": "Emo is a genre blending punk and rock with deeply emotional, introspective lyrics. It focuses on vulnerability, often with dramatic delivery.",
#     "Ska": "Ska is a Jamaican genre mixing Caribbean rhythms with jazz and R&B. It features upbeat horn lines and was a precursor to reggae.",
#     "Industrial": "Industrial is a harsh, experimental genre with mechanical sounds, heavy distortion, and dark themes. It often overlaps with metal and electronic music.",
#     "Synthpop": "Synthpop is electronic pop music dominated by synthesizers and catchy hooks. It rose in the '80s and emphasizes futuristic, clean sounds.",
#     "Hardcore": "Hardcore is a subgenre of punk known for its intensity, speed, and aggressive delivery. It often explores themes of resistance and social frustration.",
#     "Post-Rock": "Post-rock uses rock instruments to create expansive, atmospheric soundscapes. It often lacks vocals and focuses on texture and progression.",
#     "Shoegaze": "Shoegaze is an ethereal genre with layered guitars, dreamy vocals, and heavy use of reverb. It creates a wall of sound that’s immersive and emotional.",
#     "Progressive Rock": "Progressive rock is an experimental subgenre of rock characterized by complex compositions, long instrumental sections, and philosophical or fantastical lyrics. It often incorporates elements of classical and jazz.",
#     "World Music": "World music is a broad category that encompasses traditional and contemporary music from cultures around the globe. It often features regional instruments, folk rhythms, and culturally specific themes."
# }
