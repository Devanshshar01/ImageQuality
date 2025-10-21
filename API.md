# AI Image Quality Enhancer API Documentation

## Overview

The AI Image Quality Enhancer API provides endpoints for enhancing images up to 8K resolution using state-of-the-art AI models including Real-ESRGAN, GFPGAN, and U2Net.

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://yourdomain.com/api`

## Authentication

Currently, no authentication is required. Rate limiting is applied to prevent abuse.

## Rate Limiting

- **API Calls:** 10 requests per second per IP
- **File Uploads:** 20 requests per minute per IP
- **Batch Processing:** 5 images maximum per request

## Endpoints

### Health Check

#### `GET /health`

Check the health status of the API and models.

**Response:**
```json
{
  "status": "healthy",
  "enhancer_ready": true,
  "models_loaded": true
}
```

### Get Available Models

#### `GET /api/models`

Get information about available AI models and their capabilities.

**Response:**
```json
{
  "models": {
    "realesrgan": {
      "name": "Real-ESRGAN",
      "description": "General image super-resolution",
      "max_scale": 8,
      "supports_noise_reduction": true
    },
    "gfpgan": {
      "name": "GFPGAN",
      "description": "Face enhancement and restoration",
      "max_scale": 4,
      "supports_face_enhancement": true
    }
  },
  "capabilities": {
    "max_file_size": "30MB",
    "supported_formats": ["png", "jpg", "jpeg", "webp", "bmp", "tiff"],
    "max_images_per_batch": 5,
    "max_resolution": "8K (7680x4320)"
  }
}
```

### Enhance Single Image

#### `POST /api/enhance`

Enhance a single image with specified options.

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  - `file` (file): Image file to enhance
  - `options` (string): JSON string with enhancement options

**Enhancement Options:**
```json
{
  "scale": 4,                    // Upscaling factor (1-8)
  "noise_reduction": true,       // Enable noise reduction
  "face_enhancement": false,     // Enable face enhancement
  "background_removal": false,   // Enable background removal
  "format": "png",              // Output format (png/jpg)
  "quality": 95                 // JPEG quality (1-100)
}
```

**Response:**
```json
{
  "enhancedImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "metadata": {
    "originalSize": {
      "width": 1920,
      "height": 1080
    },
    "enhancedSize": {
      "width": 7680,
      "height": 4320
    },
    "fileSize": 2048576,
    "processingTime": 12.5,
    "options": {
      "scale": 4,
      "noise_reduction": true,
      "face_enhancement": false,
      "background_removal": false,
      "format": "png",
      "quality": 95
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file or options
- `413 Payload Too Large`: File too large
- `415 Unsupported Media Type`: Invalid file format
- `500 Internal Server Error`: Processing failed

### Enhance Multiple Images

#### `POST /api/enhance/batch`

Enhance multiple images in a single request.

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:**
  - `files` (file[]): Array of image files (max 5)
  - `options` (string): JSON string with enhancement options

**Response:**
```json
{
  "results": [
    {
      "success": true,
      "filename": "image1.jpg",
      "enhancedImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "metadata": {
        "originalSize": { "width": 1920, "height": 1080 },
        "enhancedSize": { "width": 7680, "height": 4320 },
        "fileSize": 2048576,
        "processingTime": 12.5,
        "options": { "scale": 4, "noise_reduction": true }
      }
    },
    {
      "success": false,
      "filename": "image2.jpg",
      "error": "Invalid image file"
    }
  ],
  "totalProcessed": 1,
  "totalFailed": 1
}
```

## Request Examples

### cURL

#### Single Image Enhancement
```bash
curl -X POST "http://localhost:8000/api/enhance" \
  -F "file=@image.jpg" \
  -F 'options={"scale": 4, "noise_reduction": true, "format": "png"}'
```

#### Batch Enhancement
```bash
curl -X POST "http://localhost:8000/api/enhance/batch" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F 'options={"scale": 8, "face_enhancement": true, "format": "png"}'
```

### JavaScript (Fetch API)

```javascript
// Single image enhancement
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('options', JSON.stringify({
  scale: 4,
  noise_reduction: true,
  face_enhancement: false,
  background_removal: false,
  format: 'png',
  quality: 95
}));

const response = await fetch('/api/enhance', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.enhancedImage);
```

### Python (requests)

```python
import requests
import json

# Single image enhancement
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    data = {
        'options': json.dumps({
            'scale': 4,
            'noise_reduction': True,
            'face_enhancement': False,
            'background_removal': False,
            'format': 'png',
            'quality': 95
        })
    }
    
    response = requests.post('http://localhost:8000/api/enhance', 
                           files=files, data=data)
    result = response.json()
    print(result['enhancedImage'])
```

## Response Format

### Success Response

All successful responses include:

- **enhancedImage**: Base64-encoded enhanced image
- **metadata**: Processing information and statistics

### Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 413 | Payload Too Large - File too big |
| 415 | Unsupported Media Type - Invalid file format |
| 422 | Unprocessable Entity - Invalid options |
| 500 | Internal Server Error - Processing failed |
| 503 | Service Unavailable - Models not loaded |

## File Requirements

### Supported Formats
- PNG
- JPEG/JPG
- WebP
- BMP
- TIFF

### Size Limits
- **Maximum file size:** 30MB
- **Maximum resolution:** 8K (7680x4320)
- **Minimum resolution:** 64x64 pixels

### Recommended Settings
- **Input resolution:** 1080p or higher for best results
- **File format:** PNG for lossless quality
- **Aspect ratio:** Any supported aspect ratio

## Enhancement Options

### Scale Factor
- **Range:** 1-8x
- **Recommended:** 4x for most use cases
- **Maximum:** 8x for 8K output

### Noise Reduction
- **Description:** Removes image noise and artifacts
- **Best for:** Low-quality or compressed images
- **Performance impact:** Minimal

### Face Enhancement
- **Description:** Improves facial details and quality
- **Best for:** Portrait images
- **Performance impact:** Moderate

### Background Removal
- **Description:** Removes or replaces background
- **Best for:** Product photos, portraits
- **Performance impact:** High

### Output Format
- **PNG:** Lossless quality, larger file size
- **JPG:** Compressed quality, smaller file size

## Performance Considerations

### Processing Time
- **2x upscaling:** 1-3 seconds
- **4x upscaling:** 3-8 seconds
- **8x upscaling:** 8-20 seconds

### Memory Usage
- **CPU processing:** 2-4GB RAM
- **GPU processing:** 4-8GB VRAM

### Optimization Tips
1. Use GPU acceleration when available
2. Process images in batches for efficiency
3. Choose appropriate scale factors
4. Use PNG for final output, JPG for previews

## Error Handling

### Common Errors

1. **File too large**
   - Reduce file size or resolution
   - Use compression

2. **Unsupported format**
   - Convert to supported format
   - Check file extension

3. **Processing timeout**
   - Reduce image size
   - Use lower scale factor

4. **Out of memory**
   - Process smaller images
   - Use CPU instead of GPU

### Retry Logic

Implement exponential backoff for retries:

```javascript
async function enhanceWithRetry(file, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: createFormData(file, options)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (i === maxRetries - 1) {
        throw new Error('Max retries exceeded');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
}
```

## Rate Limiting

### Limits
- **API calls:** 10 per second per IP
- **File uploads:** 20 per minute per IP
- **Batch processing:** 5 images per request

### Headers
Rate limit information is included in response headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits
When rate limited, wait for the reset time before retrying:

```javascript
const resetTime = response.headers.get('X-RateLimit-Reset');
const waitTime = new Date(resetTime * 1000) - new Date();
await new Promise(resolve => setTimeout(resolve, waitTime));
```

## WebSocket Support

For real-time processing updates, WebSocket support can be added:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Processing update:', data.progress);
};
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install ai-image-enhancer-client
```

### Python
```bash
pip install ai-image-enhancer
```

### Go
```bash
go get github.com/your-org/ai-image-enhancer-go
```

## Changelog

### v1.0.0
- Initial release
- Real-ESRGAN integration
- GFPGAN face enhancement
- U2Net background removal
- Batch processing support
- RESTful API design