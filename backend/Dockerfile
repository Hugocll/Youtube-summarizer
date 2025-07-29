# Use a Python 3.11 base image with Debian Bullseye
FROM python:3.11-slim-bullseye

# Set the working directory to /app
WORKDIR /app

# Install system dependencies required by yt-dlp and whisper
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Create directories for downloads
RUN mkdir -p audio_downloads video_downloads

# Set environment variables
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Expose port 5000
EXPOSE 5000

# Define the command to run the Flask application
CMD ["python", "app.py"]