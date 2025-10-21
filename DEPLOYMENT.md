# AI Image Quality Enhancer - Deployment Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **CUDA (Optional)** - For GPU acceleration

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-image-enhancer
```

2. **Run the setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start the application:**
```bash
chmod +x start.sh
./start.sh
```

4. **Open your browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t ai-image-enhancer .

# Run the container
docker run -p 80:80 -p 8000:8000 ai-image-enhancer
```

## ☁️ Cloud Deployment

### Vercel (Frontend)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy frontend:**
```bash
cd frontend
vercel --prod
```

3. **Update API URL in environment variables:**
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter your backend URL
```

### Render (Backend)

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure build settings:**
   - Build Command: `cd backend && pip install -r requirements.txt && python download_models.py`
   - Start Command: `cd backend && python main.py`
4. **Set environment variables:**
   - `PYTHON_VERSION`: `3.9`
   - `PORT`: `8000`

### Hugging Face Spaces

1. **Create a new Space on Hugging Face**
2. **Upload your code**
3. **Create `app.py`:**
```python
import subprocess
import sys

# Install dependencies
subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])

# Start the app
from backend.main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
```

## 🔧 Manual Setup

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Download AI models:**
```bash
python download_models.py
```

5. **Start the server:**
```bash
python main.py
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm start
```

## 🌐 Production Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Backend Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Model Configuration
MODEL_PATH=./models
CUDA_VISIBLE_DEVICES=0

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# File Upload
MAX_FILE_SIZE=31457280  # 30MB
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
```

### Nginx Configuration

For production deployment, use this nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for image processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }
}
```

## 🔒 Security Considerations

1. **File Upload Security:**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Use secure file storage

2. **API Security:**
   - Implement rate limiting
   - Use HTTPS in production
   - Add authentication if needed

3. **Resource Management:**
   - Set memory limits
   - Implement request timeouts
   - Monitor disk usage

## 📊 Monitoring and Logging

### Health Checks

The application includes health check endpoints:

- `GET /health` - Basic health check
- `GET /api/models` - Model status

### Logging

Configure logging in `backend/main.py`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

## 🚨 Troubleshooting

### Common Issues

1. **CUDA Out of Memory:**
   - Reduce batch size
   - Use CPU instead of GPU
   - Process smaller images

2. **Model Loading Errors:**
   - Check model files exist
   - Verify CUDA installation
   - Check Python dependencies

3. **File Upload Issues:**
   - Check file size limits
   - Verify file permissions
   - Check disk space

### Performance Optimization

1. **GPU Acceleration:**
   - Install CUDA toolkit
   - Use compatible PyTorch version
   - Monitor GPU memory usage

2. **Memory Management:**
   - Process images in batches
   - Clear memory after processing
   - Use image compression

3. **Caching:**
   - Cache processed images
   - Use CDN for static assets
   - Implement Redis caching

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer:**
   - Use nginx or HAProxy
   - Distribute requests across instances
   - Implement health checks

2. **Container Orchestration:**
   - Use Kubernetes
   - Auto-scale based on load
   - Manage resources efficiently

### Vertical Scaling

1. **Increase Resources:**
   - More CPU cores
   - More RAM
   - Better GPU

2. **Optimize Models:**
   - Use quantized models
   - Implement model pruning
   - Use TensorRT optimization

## 📞 Support

For issues and questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [API documentation](http://localhost:8000/docs)
3. Open an issue on GitHub
4. Check the logs for error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.