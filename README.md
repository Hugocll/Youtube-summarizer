# YouTube Summarizer

A full-stack application that downloads YouTube videos, transcribes audio using OpenAI Whisper, and generates summaries using AI. Built with React (TypeScript) frontend and Flask (Python) backend, fully containerized with Docker.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM (for Whisper model)

### Development Mode
```bash
./start-dev.sh
```

### Production Mode
```bash
./start-prod.sh
```

After starting, access:
- **Frontend**: http://localhost:52123
- **Backend API**: http://localhost:53124

## 🔑 API Key Configuration

Before using the summarization feature, you need to configure your OpenRouter API key:

1. **Get an API Key**: Visit [OpenRouter](https://openrouter.ai/keys) to create an account and get your API key
2. **Configure in App**: Click the key button (🔑) in the top-right corner of the application
3. **Enter Your Key**: Paste your OpenRouter API key in the modal that appears
4. **Save**: Click "Save" to store the key securely in your browser

The key button will be:
- **Red and pulsing**: No API key configured
- **Green**: API key is configured and ready to use

Your API key is stored locally in your browser and is never sent to any server except OpenRouter for AI processing.

## 📋 Features

- **Video Information**: Fetch YouTube video metadata (title, duration, thumbnail, etc.)
- **Audio Transcription**: Extract and transcribe audio using OpenAI Whisper
- **AI Summarization**: Generate summaries using OpenRouter API with configurable API key
- **Video Download**: Download YouTube videos to the backend server
- **Secure API Key Management**: Configure your OpenRouter API key through the UI
- **Responsive UI**: Modern React interface with Tailwind CSS
- **Docker Support**: Full containerization for easy deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React/TS)    │◄──►│   (Flask/Python)│
│   Port: 52123   │    │   Port: 53124   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **API Configuration**: Dynamic endpoint resolution for different environments

### Backend (Flask + Python)
- **Framework**: Flask with CORS support
- **Audio Processing**: yt-dlp + FFmpeg + OpenAI Whisper
- **AI Integration**: OpenRouter API for summarization
- **Storage**: Local file system with Docker volumes

## 🔧 Configuration

### Environment Variables

#### Frontend
- `REACT_APP_API_BASE_URL`: Backend API URL
- `REACT_APP_ENVIRONMENT`: Environment type (development/docker/production)

#### Backend
- `PORT`: Server port (default: 5000)
- `PYTHONUNBUFFERED`: Python output buffering (set to 1)
- `FLASK_ENV`: Flask environment mode

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/video_info` | POST | Get YouTube video metadata |
| `/transcribe` | POST | Transcribe video audio |
| `/summarize` | POST | Transcribe and summarize video |
| `/download` | POST | Download video file |

## 🐳 Docker Setup

### Development Configuration (`docker-compose.yml`)
- Hot reloading enabled
- Development environment variables
- Named volumes for data persistence

### Production Configuration (`docker-compose.prod.yml`)
- Optimized builds
- Nginx for frontend serving
- Health checks
- Restart policies

### Volumes
- `audio_downloads`: Temporary audio files
- `video_downloads`: Downloaded video files

## 🛠️ Development

### Local Development (without Docker)

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Files
- `.env.development`: Local development
- `.env.docker`: Docker development
- `.env.production`: Production deployment

## 🔍 Troubleshooting

### Common Issues

#### 1. `net::ERR_NAME_NOT_RESOLVED`
**Solution**: The API configuration automatically handles different environments. Ensure Docker containers are running.

#### 2. Backend Container Exits
**Possible causes**:
- Missing FFmpeg (fixed in Dockerfile)
- Port conflicts (check if port 53124 is available)
- Memory issues (Whisper requires significant RAM)

#### 3. Audio Processing Fails
**Solution**: Ensure FFmpeg is installed (included in Docker image).

#### 4. CORS Errors
**Solution**: Flask-CORS is configured to handle cross-origin requests.

### Debugging Commands

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down --rmi all --volumes
docker-compose up --build
```

## 📊 System Requirements

### Minimum
- **RAM**: 4GB (for Whisper base model)
- **Storage**: 2GB free space
- **CPU**: 2 cores

### Recommended
- **RAM**: 8GB+ (for better performance)
- **Storage**: 10GB+ (for video downloads)
- **CPU**: 4+ cores

## 🔐 Security Notes

- No authentication implemented (suitable for local/development use)
- CORS is enabled for all origins (restrict in production)
- OpenRouter API key is now securely managed through the UI (stored in browser localStorage)

## 🚀 Deployment

### Production Deployment
1. Configure proper CORS origins
2. Set up reverse proxy (nginx) if needed
3. Use `docker-compose.prod.yml` for production
4. Users will configure their own OpenRouter API keys through the UI

### Scaling Considerations
- Backend can be scaled horizontally
- Consider using external storage for large video files
- Implement queue system for long-running transcription tasks

## 📝 API Usage Examples

### Get Video Information
```bash
curl -X POST http://localhost:53124/video_info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Transcribe Video
```bash
curl -X POST http://localhost:53124/transcribe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Docker logs
3. Ensure all prerequisites are met
4. Create an issue with detailed error information

---

**Built with ❤️ using React, Flask, Docker, and OpenAI Whisper**