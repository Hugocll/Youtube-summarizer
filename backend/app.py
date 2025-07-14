from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import yt_dlp
import os
import whisper

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Directory to store downloaded audio files
AUDIO_DIR = 'audio_downloads'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load Whisper model
# You might want to load a larger model depending on accuracy needs and available resources
# For now, using 'base'
model = whisper.load_model("base")

@app.route('/')
def home():
    return "YouTube Summarizer Backend"

@app.route('/summarize_youtube', methods=['POST', 'OPTIONS'])
def summarize_youtube():
    print("Received request to /summarize_youtube") # Added print statement
    if request.method == 'OPTIONS':
        # This is a preflight request, Flask-CORS should handle it,
        # but we'll explicitly return 200 OK for debugging
        return '', 200
    data = request.get_json()
    youtube_url = data.get('url')

    if not youtube_url:
        return jsonify({"error": "URL is required"}), 400

    # 1. Download audio
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(AUDIO_DIR, '%(id)s.mp3'),
        'noplaylist': True,
    }

    audio_filepath = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=True)
            audio_filepath = ydl.prepare_filename(info_dict)
            if not audio_filepath.endswith('.mp3'):
                audio_filepath = audio_filepath + '.mp3'
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
        return jsonify({"transcript": transcript}), 200
    except Exception as e:
        # Ensure audio file is removed even if transcription fails
        if audio_filepath and os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        return jsonify({"error": f"Failed to transcribe audio: {str(e)}"}), 500

# Remove the old download_audio and transcribe_audio routes as they are now internal
# @app.route('/download_audio', methods=['POST'])
# def download_audio():
#     pass # This functionality is now integrated into summarize_youtube

# @app.route('/transcribe_audio', methods=['POST'])
# def transcribe_audio():
#     pass # This functionality is now integrated into summarize_youtube

if __name__ == '__main__':
    app.run(debug=True, port=5001)