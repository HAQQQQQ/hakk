# whisper_blueprint.py
from flask import Blueprint
from whisper_transcription import WhisperTranscriptionService

# Create blueprint
whisper_bp = Blueprint('whisper', __name__)
whisper_service = WhisperTranscriptionService()

@whisper_bp.route('/transcribe', methods=['POST'])
def transcribe():
    return whisper_service.start_transcription()

@whisper_bp.route('/transcribe/<job_id>', methods=['GET'])
def get_transcription_status(job_id):
    return whisper_service.get_transcription_status(job_id)

@whisper_bp.route('/transcribe/download/<job_id>', methods=['GET'])
def download_transcript(job_id):
    return whisper_service.download_transcript(job_id)