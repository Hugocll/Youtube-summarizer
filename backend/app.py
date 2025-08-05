from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import yt_dlp
import os
import whisper
import requests
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Directory to store downloaded audio files
AUDIO_DIR = 'audio_downloads'
VIDEO_DIR = 'video_downloads'
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# Load Whisper model with error handling
try:
    logger.info("Loading Whisper model...")
    model = whisper.load_model("base")
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {str(e)}")
    model = None

@app.route('/')
def home():
    return "YouTube Summarizer Backend"

@app.route('/transcribe', methods=['POST', 'OPTIONS'])
def transcribe():
    logger.info("Received request to /transcribe")
    if request.method == 'OPTIONS':
        return '', 200
    
    # Check if Whisper model is loaded
    if model is None:
        logger.error("Whisper model not available")
        return jsonify({"error": "Transcription service unavailable"}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
            
        youtube_url = data.get('url')
        if not youtube_url:
            return jsonify({"error": "URL is required"}), 400

        logger.info(f"Processing transcription for URL: {youtube_url}")

        # 1. Download audio
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(AUDIO_DIR, '%(id)s'),
            'noplaylist': True,
            'quiet': True,
        }

        audio_filepath = None
        try:
            logger.info("Starting audio download...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(youtube_url, download=True)
                audio_filepath = os.path.join(AUDIO_DIR, f"{info_dict['id']}.mp3")
            logger.info(f"Audio downloaded to: {audio_filepath}")
        except Exception as e:
            logger.error(f"Audio download failed: {str(e)}")
            return jsonify({"error": f"Failed to download audio: {str(e)}"}), 500

        if not audio_filepath or not os.path.exists(audio_filepath):
            logger.error("Audio file not found after download")
            return jsonify({"error": "Audio file not found after download"}), 500

        # 2. Transcribe audio
        try:
            logger.info("Starting transcription...")
            result = model.transcribe(audio_filepath)
            transcript = result["text"]
            logger.info("Transcription completed successfully")
            
            # Clean up: delete the audio file after transcription
            if os.path.exists(audio_filepath):
                os.remove(audio_filepath)
                logger.info("Audio file cleaned up")
            
            return jsonify({"transcript": transcript}), 200
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            # Ensure audio file is removed even if transcription fails
            if audio_filepath and os.path.exists(audio_filepath):
                os.remove(audio_filepath)
            return jsonify({"error": f"Failed to transcribe audio: {str(e)}"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in transcribe endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/summarize', methods=['POST', 'OPTIONS'])
def summarize():
    print("Received request to /summarize")
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    youtube_url = data.get('url')
    api_key = data.get('apiKey')

    if not youtube_url:
        return jsonify({"error": "URL is required"}), 400
    
    if not api_key:
        return jsonify({"error": "OpenRouter API key is required"}), 400

    # 1. Download audio (same as transcribe endpoint)
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(AUDIO_DIR, '%(id)s'),
        'noplaylist': True,
    }

    audio_filepath = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=True)
            audio_filepath = os.path.join(AUDIO_DIR, f"{info_dict['id']}.mp3")
    except Exception as e:
        return jsonify({"error": f"Failed to download audio: {str(e)}"}), 500

    if not audio_filepath or not os.path.exists(audio_filepath):
        return jsonify({"error": "Audio file not found after download"}), 500

    # 2. Transcribe audio
    try:
        result = model.transcribe(audio_filepath)
        transcript = result["text"]
        # Clean up: delete the audio file after transcription
        os.remove(audio_filepath)
    except Exception as e:
        # Ensure audio file is removed even if transcription fails
        if audio_filepath and os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        return jsonify({"error": f"Failed to transcribe audio: {str(e)}"}), 500

    # 3. Summarize using OpenRouter API
    try:
        openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-chat-v3-0324:free",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that creates concise and informative summaries of video transcripts. Focus on the main points, key insights, and important information."
                },
                {
                    "role": "user",
                    "content": f"Please provide a comprehensive summary of the following video transcript:\n\n{transcript}"
                }
            ]
        }
        
        response = requests.post(openrouter_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            response_data = response.json()
            summary = response_data['choices'][0]['message']['content']
            return jsonify({
                "transcript": transcript,
                "summary": summary
            }), 200
        else:
            return jsonify({"error": f"Failed to generate summary: {response.text}"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Failed to generate summary: {str(e)}"}), 500


@app.route('/download', methods=['POST', 'OPTIONS'])
def download_video():
    print("Received request to /download")
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    youtube_url = data.get('url')

    if not youtube_url:
        return jsonify({"error": "URL is required"}), 400

    # Directory to store downloaded video files
    VIDEO_DIR = 'video_downloads'
    os.makedirs(VIDEO_DIR, exist_ok=True)

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best', # Download best video and audio, merge if necessary
        'outtmpl': os.path.join(VIDEO_DIR, '%(title)s.%(ext)s'), # Save with title and extension
        'noplaylist': True,
        'merge_output_format': 'mp4', # Specify merge format if needed
    }

    video_filepath = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=True)
            # Construct the expected final path based on title and extension
            video_filepath = os.path.join(VIDEO_DIR, f"{info_dict['title']}.{info_dict['ext']}")
            
            # Check if the file was actually created
            if not os.path.exists(video_filepath):
                # Fallback if title/ext combination didn't work as expected
                # This is a simplified fallback, a more robust solution might involve checking ydl output
                # For now, we'll assume the primary path is correct or report an error
                print(f"Warning: Expected video file not found at {video_filepath}. Attempting to find downloaded file.")
                # A more robust approach would be to list files in VIDEO_DIR and match by ID or part of title
                # For simplicity, we'll rely on the primary path for now.

    except Exception as e:
        return jsonify({"error": f"Failed to download video: {str(e)}"}), 500

    if not video_filepath or not os.path.exists(video_filepath):
        return jsonify({"error": "Video file not found after download"}), 500

    return jsonify({"message": "Video downloaded successfully", "filepath": video_filepath}), 200

@app.route('/video_info', methods=['POST', 'OPTIONS'])
def get_video_info():
    print("Received request to /video_info")
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    youtube_url = data.get('url')

    if not youtube_url:
        return jsonify({"error": "URL is required"}), 400

    ydl_opts = {
        'quiet': True,  # Suppress output
        'no_warnings': True,
        'extract_flat': False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract info without downloading
            info_dict = ydl.extract_info(youtube_url, download=False)
            
            # Get video metadata
            video_info = {
                'title': info_dict.get('title', 'Unknown Title'),
                'duration': info_dict.get('duration', 0),  # Duration in seconds
                'thumbnail': info_dict.get('thumbnail', ''),
                'uploader': info_dict.get('uploader', 'Unknown'),
                'view_count': info_dict.get('view_count', 0),
                'upload_date': info_dict.get('upload_date', ''),
                'id': info_dict.get('id', '')
            }
            
            return jsonify(video_info), 200
            
    except Exception as e:
        return jsonify({"error": f"Failed to get video info: {str(e)}"}), 500

if __name__ == '__main__':
    # Use environment variable for port, default to 5000 for Docker compatibility
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', debug=True, port=port)