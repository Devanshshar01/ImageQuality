import pytest
import io
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_test_image(width=100, height=100, format='JPEG'):
    """Create a test image for testing"""
    image = Image.new('RGB', (width, height), color='red')
    img_io = io.BytesIO()
    image.save(img_io, format=format)
    img_io.seek(0)
    return img_io

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "enhancer_ready" in data

def test_get_models():
    """Test models endpoint"""
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "capabilities" in data

def test_enhance_single_image():
    """Test single image enhancement"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {
        "options": '{"scale": 2, "noise_reduction": true, "format": "png"}'
    }
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 200
    
    result = response.json()
    assert "enhancedImage" in result
    assert "metadata" in result
    assert result["metadata"]["enhancedSize"]["width"] == 200
    assert result["metadata"]["enhancedSize"]["height"] == 200

def test_enhance_invalid_file():
    """Test enhancement with invalid file"""
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    data = {"options": '{"scale": 2}'}
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 400

def test_enhance_large_file():
    """Test enhancement with file too large"""
    # Create a large image (simulate)
    large_image = create_test_image(4000, 4000)
    
    files = {"file": ("large.jpg", large_image, "image/jpeg")}
    data = {"options": '{"scale": 2}'}
    
    response = client.post("/api/enhance", files=files, data=data)
    # Should either succeed or fail gracefully
    assert response.status_code in [200, 413]

def test_enhance_batch():
    """Test batch image enhancement"""
    test_images = [
        ("image1.jpg", create_test_image(50, 50), "image/jpeg"),
        ("image2.jpg", create_test_image(75, 75), "image/jpeg")
    ]
    
    files = [("files", img) for _, img, _ in test_images]
    data = {"options": '{"scale": 2, "format": "png"}'}
    
    response = client.post("/api/enhance/batch", files=files, data=data)
    assert response.status_code == 200
    
    result = response.json()
    assert "results" in result
    assert len(result["results"]) == 2
    assert result["totalProcessed"] == 2

def test_enhance_batch_too_many():
    """Test batch enhancement with too many files"""
    test_images = [create_test_image(50, 50) for _ in range(6)]
    
    files = [("files", img) for img in test_images]
    data = {"options": '{"scale": 2}'}
    
    response = client.post("/api/enhance/batch", files=files, data=data)
    assert response.status_code == 400

def test_enhance_invalid_options():
    """Test enhancement with invalid options"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": '{"scale": 20}'}  # Invalid scale
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 422

def test_enhance_missing_file():
    """Test enhancement without file"""
    data = {"options": '{"scale": 2}'}
    
    response = client.post("/api/enhance", data=data)
    assert response.status_code == 400

def test_enhance_missing_options():
    """Test enhancement without options"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    
    response = client.post("/api/enhance", files=files)
    assert response.status_code == 400

def test_enhance_different_formats():
    """Test enhancement with different image formats"""
    formats = ['JPEG', 'PNG', 'WEBP']
    
    for format in formats:
        test_image = create_test_image(format=format)
        files = {"file": (f"test.{format.lower()}", test_image, f"image/{format.lower()}")}
        data = {"options": '{"scale": 2, "format": "png"}'}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200

def test_enhance_different_scales():
    """Test enhancement with different scale factors"""
    scales = [2, 4, 8]
    
    for scale in scales:
        test_image = create_test_image(100, 100)
        files = {"file": ("test.jpg", test_image, "image/jpeg")}
        data = {"options": f'{{"scale": {scale}}}'}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        expected_width = 100 * scale
        expected_height = 100 * scale
        assert result["metadata"]["enhancedSize"]["width"] == expected_width
        assert result["metadata"]["enhancedSize"]["height"] == expected_height

def test_enhance_with_face_enhancement():
    """Test enhancement with face enhancement enabled"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": '{"scale": 2, "face_enhancement": true}'}
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 200

def test_enhance_with_background_removal():
    """Test enhancement with background removal enabled"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": '{"scale": 2, "background_removal": true}'}
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 200

def test_enhance_jpeg_quality():
    """Test enhancement with JPEG quality setting"""
    test_image = create_test_image()
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": '{"scale": 2, "format": "jpg", "quality": 80}'}
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 200

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "status" in data

if __name__ == "__main__":
    pytest.main([__file__])