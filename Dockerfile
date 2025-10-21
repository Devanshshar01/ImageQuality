# Multi-stage Dockerfile for AI Image Enhancer
FROM python:3.9-slim as backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Download models
RUN python download_models.py

# Expose backend port
EXPOSE 8000

# Start backend
CMD ["python", "main.py"]

# Frontend stage
FROM node:18-alpine as frontend

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip

# Copy backend from backend stage
COPY --from=backend /app /app/backend

# Copy frontend build from frontend stage
COPY --from=frontend /app/out /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Install Python dependencies
RUN pip3 install --no-cache-dir -r /app/backend/requirements.txt

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && python3 main.py &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 8000

# Start both services
CMD ["/start.sh"]