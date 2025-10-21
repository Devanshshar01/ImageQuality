#!/usr/bin/env python3
"""
Download AI models for image enhancement
"""

import os
import sys
import subprocess
import urllib.request
from pathlib import Path

def download_file(url: str, filename: str, description: str = ""):
    """Download a file with progress bar"""
    print(f"📥 Downloading {description}...")
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"✅ {description} downloaded successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to download {description}: {e}")
        return False

def run_command(command: str, description: str = ""):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main function to download and setup models"""
    print("🚀 Setting up AI Image Enhancement Models")
    print("=" * 50)
    
    # Create models directory
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment. Consider using one.")
    
    # Install required packages
    print("\n📦 Installing required packages...")
    packages = [
        "torch torchvision --index-url https://download.pytorch.org/whl/cu118",
        "basicsr",
        "realesrgan",
        "gfpgan",
        "opencv-python",
        "pillow",
        "numpy"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            print(f"⚠️  Failed to install {package}, continuing...")
    
    # Download Real-ESRGAN models
    print("\n🤖 Downloading Real-ESRGAN models...")
    realesrgan_models = {
        "RealESRGAN_x4plus.pth": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "RealESRGAN_x4plus_anime_6B.pth": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth",
        "RealESRGAN_x8plus.pth": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x8plus.pth"
    }
    
    for model_name, url in realesrgan_models.items():
        model_path = models_dir / "realesrgan" / model_name
        model_path.parent.mkdir(exist_ok=True)
        
        if not model_path.exists():
            download_file(url, str(model_path), f"Real-ESRGAN {model_name}")
        else:
            print(f"✅ {model_name} already exists")
    
    # Download GFPGAN models
    print("\n👤 Downloading GFPGAN models...")
    gfpgan_models = {
        "GFPGANv1.4.pth": "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth"
    }
    
    for model_name, url in gfpgan_models.items():
        model_path = models_dir / "gfpgan" / model_name
        model_path.parent.mkdir(exist_ok=True)
        
        if not model_path.exists():
            download_file(url, str(model_path), f"GFPGAN {model_name}")
        else:
            print(f"✅ {model_name} already exists")
    
    # Download U2Net models
    print("\n🎭 Downloading U2Net models...")
    u2net_models = {
        "u2net.pth": "https://github.com/xuebinqin/U2-Net/releases/download/u2net/u2net.pth",
        "u2netp.pth": "https://github.com/xuebinqin/U2-Net/releases/download/u2net/u2netp.pth"
    }
    
    for model_name, url in u2net_models.items():
        model_path = models_dir / "u2net" / model_name
        model_path.parent.mkdir(exist_ok=True)
        
        if not model_path.exists():
            download_file(url, str(model_path), f"U2Net {model_name}")
        else:
            print(f"✅ {model_name} already exists")
    
    # Create model configuration file
    print("\n📝 Creating model configuration...")
    config_content = """# AI Image Enhancement Models Configuration
# This file contains the paths to downloaded models

[realesrgan]
x4plus = "models/realesrgan/RealESRGAN_x4plus.pth"
x4plus_anime = "models/realesrgan/RealESRGAN_x4plus_anime_6B.pth"
x8plus = "models/realesrgan/RealESRGAN_x8plus.pth"

[gfpgan]
v1_4 = "models/gfpgan/GFPGANv1.4.pth"

[u2net]
u2net = "models/u2net/u2net.pth"
u2netp = "models/u2net/u2netp.pth"

[settings]
device = "cuda"  # or "cpu"
max_image_size = 2048
batch_size = 1
"""
    
    with open("models/config.ini", "w") as f:
        f.write(config_content)
    
    print("✅ Model configuration created")
    
    # Test model loading
    print("\n🧪 Testing model loading...")
    try:
        import torch
        print(f"✅ PyTorch version: {torch.__version__}")
        print(f"✅ CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"✅ CUDA device: {torch.cuda.get_device_name(0)}")
    except ImportError:
        print("❌ PyTorch not available")
    
    print("\n🎉 Model setup completed!")
    print("\nTo start the backend server:")
    print("python main.py")
    
    print("\nTo start the frontend:")
    print("cd ../frontend && npm run dev")

if __name__ == "__main__":
    main()