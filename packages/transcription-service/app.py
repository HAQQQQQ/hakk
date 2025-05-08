# app.py
from flask import Flask
from blueprints.whisper_blueprint import whisper_bp
from blueprints.matcher_blueprint import matcher_bp
from config import Config
from dotenv import load_dotenv
# Alternative import style
from matcher import matcher_bp
from transcription import whisper_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Register blueprints
app.register_blueprint(whisper_bp, url_prefix='/api/whisper')
app.register_blueprint(matcher_bp, url_prefix='/api/matcher')

# Root endpoint
@app.route('/')
def root():
    return {
        "message": "Transcription Service API",
        "endpoints": {
            "matcher": "/api/matcher",
            "whisper": "/api/whisper"
        }
    }

if __name__ == '__main__':
    app.run(
        debug=Config.DEBUG,
        host='0.0.0.0',
        port=Config.PORT
    )