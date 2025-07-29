#!/bin/bash

# YouTube Summarizer - Development Startup Script
echo "🚀 Starting YouTube Summarizer in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:52123"
echo "🔧 Backend: http://localhost:53124"
echo ""
echo "To stop the services, press Ctrl+C or run: docker-compose down"