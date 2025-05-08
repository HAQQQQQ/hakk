# whisper_transcription.py
import whisper
import os
import tempfile
from werkzeug.utils import secure_filename
import uuid
from threading import Thread
import time
from flask import request, jsonify

class WhisperTranscriptionService:
    def __init__(self, upload_folder='uploads', model_name='base'):
        self.upload_folder = upload_folder
        self.allowed_extensions = {'mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'}
        self.processing_jobs = {}
        
        # Ensure upload folder exists
        os.makedirs(upload_folder, exist_ok=True)
        
        # Load Whisper model once at startup
        self.model = whisper.load_model(model_name)
    
    def allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def process_video_async(self, job_id, file_path, params):
        """Process video transcription in background"""
        try:
            self.processing_jobs[job_id]['status'] = 'processing'
            
            # Transcribe the video
            result = self.model.transcribe(
                file_path,
                language=params.get('language', 'auto'),
                task=params.get('task', 'transcribe'),
                word_timestamps=params.get('word_timestamps', True)
            )
            
            self.processing_jobs[job_id].update({
                'status': 'completed',
                'result': result,
                'completed_at': time.time()
            })
            
        except Exception as e:
            self.processing_jobs[job_id].update({
                'status': 'failed',
                'error': str(e),
                'completed_at': time.time()
            })
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    def start_transcription(self):
        """Handle video upload and start transcription"""
        
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not self.allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(self.upload_folder, unique_filename)
        file.save(file_path)
        
        # Get transcription parameters
        params = {
            'language': request.form.get('language', 'auto'),
            'task': request.form.get('task', 'transcribe'),
            'word_timestamps': request.form.get('word_timestamps', 'true').lower() == 'true'
        }
        
        # Create job
        job_id = str(uuid.uuid4())
        self.processing_jobs[job_id] = {
            'status': 'queued',
            'filename': filename,
            'created_at': time.time(),
            'params': params
        }
        
        # Start background processing
        thread = Thread(
            target=self.process_video_async,
            args=(job_id, file_path, params)
        )
        thread.start()
        
        return jsonify({
            'job_id': job_id,
            'status': 'queued',
            'message': 'Video uploaded and queued for transcription'
        }), 202
    
    def get_transcription_status(self, job_id):
        """Get status of transcription job"""
        
        if job_id not in self.processing_jobs:
            return jsonify({'error': 'Job not found'}), 404
        
        job = self.processing_jobs[job_id]
        
        if job['status'] == 'completed':
            return jsonify({
                'job_id': job_id,
                'status': job['status'],
                'filename': job['filename'],
                'transcript': job['result']['text'],
                'segments': job['result']['segments'],
                'language': job['result']['language'],
                'duration': job['result']['duration']
            })
        elif job['status'] == 'failed':
            return jsonify({
                'job_id': job_id,
                'status': job['status'],
                'error': job['error']
            }), 500
        else:
            return jsonify({
                'job_id': job_id,
                'status': job['status'],
                'message': 'Transcription in progress...'
            })
    
    def download_transcript(self, job_id):
        """Download transcript in various formats"""
        
        if job_id not in self.processing_jobs:
            return jsonify({'error': 'Job not found'}), 404
        
        job = self.processing_jobs[job_id]
        
        if job['status'] != 'completed':
            return jsonify({'error': 'Job not completed'}), 400
        
        format_type = request.args.get('format', 'txt')
        result = job['result']
        
        if format_type == 'srt':
            # Generate SRT format
            srt_content = ""
            for i, segment in enumerate(result['segments']):
                start = self.format_time_srt(segment['start'])
                end = self.format_time_srt(segment['end'])
                srt_content += f"{i+1}\n{start} --> {end}\n{segment['text']}\n\n"
            
            return srt_content, 200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': f'attachment; filename="{job["filename"]}_transcript.srt"'
            }
        
        elif format_type == 'vtt':
            # Generate VTT format
            vtt_content = "WEBVTT\n\n"
            for segment in result['segments']:
                start = self.format_time_vtt(segment['start'])
                end = self.format_time_vtt(segment['end'])
                vtt_content += f"{start} --> {end}\n{segment['text']}\n\n"
            
            return vtt_content, 200, {
                'Content-Type': 'text/vtt',
                'Content-Disposition': f'attachment; filename="{job["filename"]}_transcript.vtt"'
            }
        
        else:  # Default to TXT
            return result['text'], 200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': f'attachment; filename="{job["filename"]}_transcript.txt"'
            }
    
    @staticmethod
    def format_time_srt(seconds):
        """Format time for SRT files"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    @staticmethod
    def format_time_vtt(seconds):
        """Format time for VTT files"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millisecs:03d}"