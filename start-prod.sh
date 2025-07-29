#!/bin/bash

# YouTube Summarizer - Production Startup Script
echo "🚀 Starting YouTube Summarizer in Production Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans 2>/dev/null || true

# Build and start services in production mode
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Production environment started successfully!"
    echo "📱 Frontend: http://localhost:52123"
    echo "🔧 Backend: http://localhost:53124"
    echo ""
    echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "To stop: docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Failed to start services. Check logs with:"
    echo "docker-compose -f docker-compose.prod.yml logs"
fi