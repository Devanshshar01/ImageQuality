import os
import asyncio
import base64
import tempfile
import io
from typing import Optional, Dict, Any
from pathlib import Path
import time

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import cv2

from models.image_enhancer import ImageEnhancer
from utils.image_utils import get_image_dimensions, validate_image, optimize_image
from schemas.enhancement_options import EnhancementOptions

app = FastAPI(
    title="AI Image Quality Enhancer API",
    description="Enhance images up to 8K resolution using AI models",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize image enhancer
enhancer = None

@app.on_event("startup")
async def startup_event():
    """Initialize the image enhancer on startup"""
    global enhancer
    try:
        enhancer = ImageEnhancer()
        await enhancer.initialize()
        print("✅ Image enhancer initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize image enhancer: {e}")
        enhancer = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Image Quality Enhancer API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "enhancer_ready": enhancer is not None,
        "models_loaded": enhancer.is_ready() if enhancer else False
    }

@app.get("/api/models")
async def get_models():
    """Get available models and their capabilities"""
    if not enhancer:
        raise HTTPException(status_code=503, detail="Image enhancer not initialized")
    
    return {
        "models": {
            "realesrgan": {
                "name": "Real-ESRGAN",
                "description": "General image super-resolution",
                "max_scale": 8,
                "supports_noise_reduction": True
            },
            "gfpgan": {
                "name": "GFPGAN",
                "description": "Face enhancement and restoration",
                "max_scale": 4,
                "supports_face_enhancement": True
            }
        },
        "capabilities": {
            "max_file_size": "30MB",
            "supported_formats": ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
            "max_images_per_batch": 5,
            "max_resolution": "8K (7680x4320)"
        }
    }

@app.post("/api/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    options: str = Form(...)
):
    """Enhance a single image"""
    if not enhancer:
        raise HTTPException(status_code=503, detail="Image enhancer not initialized")
    
    try:
        # Parse options
        enhancement_options = EnhancementOptions.parse_raw(options)
        
        # Validate file
        if not validate_image(file):
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Read and process image
        image_data = await file.read()
        
        # Get original dimensions
        original_image = Image.open(io.BytesIO(image_data))
        original_width, original_height = original_image.size
        
        # Enhance image
        start_time = time.time()
        enhanced_image_data = await enhancer.enhance_image(
            image_data, 
            enhancement_options
        )
        processing_time = time.time() - start_time
        
        # Get enhanced dimensions
        enhanced_image = Image.open(io.BytesIO(enhanced_image_data))
        enhanced_width, enhanced_height = enhanced_image.size
        
        # Convert to base64
        enhanced_base64 = base64.b64encode(enhanced_image_data).decode('utf-8')
        enhanced_data_url = f"data:image/{enhancement_options.format};base64,{enhanced_base64}"
        
        return {
            "enhancedImage": enhanced_data_url,
            "metadata": {
                "originalSize": {
                    "width": original_width,
                    "height": original_height
                },
                "enhancedSize": {
                    "width": enhanced_width,
                    "height": enhanced_height
                },
                "fileSize": len(image_data),
                "processingTime": round(processing_time, 2),
                "options": enhancement_options.dict()
            }
        }
        
    except Exception as e:
        print(f"Enhancement error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enhance image: {str(e)}")

@app.post("/api/enhance/batch")
async def enhance_batch(
    files: list[UploadFile] = File(...),
    options: str = Form(...)
):
    """Enhance multiple images in batch"""
    if not enhancer:
        raise HTTPException(status_code=503, detail="Image enhancer not initialized")
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed per batch")
    
    try:
        # Parse options
        enhancement_options = EnhancementOptions.parse_raw(options)
        
        results = []
        
        for i, file in enumerate(files):
            try:
                # Validate file
                if not validate_image(file):
                    results.append({
                        "success": False,
                        "filename": file.filename,
                        "error": "Invalid image file"
                    })
                    continue
                
                # Read and process image
                image_data = await file.read()
                
                # Get original dimensions
                original_image = Image.open(io.BytesIO(image_data))
                original_width, original_height = original_image.size
                
                # Enhance image
                start_time = time.time()
                enhanced_image_data = await enhancer.enhance_image(
                    image_data, 
                    enhancement_options
                )
                processing_time = time.time() - start_time
                
                # Get enhanced dimensions
                enhanced_image = Image.open(io.BytesIO(enhanced_image_data))
                enhanced_width, enhanced_height = enhanced_image.size
                
                # Convert to base64
                enhanced_base64 = base64.b64encode(enhanced_image_data).decode('utf-8')
                enhanced_data_url = f"data:image/{enhancement_options.format};base64,{enhanced_base64}"
                
                results.append({
                    "success": True,
                    "filename": file.filename,
                    "enhancedImage": enhanced_data_url,
                    "metadata": {
                        "originalSize": {
                            "width": original_width,
                            "height": original_height
                        },
                        "enhancedSize": {
                            "width": enhanced_width,
                            "height": enhanced_height
                        },
                        "fileSize": len(image_data),
                        "processingTime": round(processing_time, 2),
                        "options": enhancement_options.dict()
                    }
                })
                
            except Exception as e:
                results.append({
                    "success": False,
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "results": results,
            "totalProcessed": len([r for r in results if r["success"]]),
            "totalFailed": len([r for r in results if not r["success"]])
        }
        
    except Exception as e:
        print(f"Batch enhancement error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enhance images: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)