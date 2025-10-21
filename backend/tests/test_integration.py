import pytest
import io
import json
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_test_image(width=100, height=100, format='JPEG', color='red'):
    """Create a test image for testing"""
    image = Image.new('RGB', (width, height), color=color)
    img_io = io.BytesIO()
    image.save(img_io, format=format)
    img_io.seek(0)
    return img_io

def test_full_enhancement_workflow():
    """Test complete enhancement workflow from upload to download"""
    # Step 1: Check health
    health_response = client.get("/health")
    assert health_response.status_code == 200
    assert health_response.json()["status"] == "healthy"
    
    # Step 2: Get available models
    models_response = client.get("/api/models")
    assert models_response.status_code == 200
    models_data = models_response.json()
    assert "models" in models_data
    assert "capabilities" in models_data
    
    # Step 3: Upload and enhance image
    test_image = create_test_image(200, 200, 'JPEG', 'blue')
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {
        "options": json.dumps({
            "scale": 4,
            "noise_reduction": True,
            "face_enhancement": False,
            "background_removal": False,
            "format": "png",
            "quality": 95
        })
    }
    
    enhance_response = client.post("/api/enhance", files=files, data=data)
    assert enhance_response.status_code == 200
    
    result = enhance_response.json()
    assert "enhancedImage" in result
    assert "metadata" in result
    
    # Verify metadata
    metadata = result["metadata"]
    assert metadata["originalSize"]["width"] == 200
    assert metadata["originalSize"]["height"] == 200
    assert metadata["enhancedSize"]["width"] == 800
    assert metadata["enhancedSize"]["height"] == 800
    assert metadata["processingTime"] > 0
    assert metadata["options"]["scale"] == 4
    
    # Verify enhanced image is valid base64
    enhanced_image_data = result["enhancedImage"]
    assert enhanced_image_data.startswith("data:image/png;base64,")
    
    # Decode and verify image
    import base64
    image_data = base64.b64decode(enhanced_image_data.split(",")[1])
    enhanced_image = Image.open(io.BytesIO(image_data))
    assert enhanced_image.size == (800, 800)

def test_batch_enhancement_workflow():
    """Test complete batch enhancement workflow"""
    # Create multiple test images
    test_images = [
        ("portrait.jpg", create_test_image(150, 200, 'JPEG', 'red')),
        ("landscape.jpg", create_test_image(300, 150, 'JPEG', 'green')),
        ("square.jpg", create_test_image(200, 200, 'JPEG', 'blue'))
    ]
    
    files = [("files", img) for _, img, _ in test_images]
    data = {
        "options": json.dumps({
            "scale": 2,
            "noise_reduction": True,
            "face_enhancement": True,
            "background_removal": False,
            "format": "png",
            "quality": 95
        })
    }
    
    batch_response = client.post("/api/enhance/batch", files=files, data=data)
    assert batch_response.status_code == 200
    
    result = batch_response.json()
    assert "results" in result
    assert result["totalProcessed"] == 3
    assert result["totalFailed"] == 0
    
    # Verify each result
    for i, image_result in enumerate(result["results"]):
        assert image_result["success"] == True
        assert image_result["filename"] == test_images[i][0]
        assert "enhancedImage" in image_result
        assert "metadata" in image_result
        
        # Verify metadata
        metadata = image_result["metadata"]
        assert metadata["originalSize"]["width"] > 0
        assert metadata["originalSize"]["height"] > 0
        assert metadata["enhancedSize"]["width"] == metadata["originalSize"]["width"] * 2
        assert metadata["enhancedSize"]["height"] == metadata["originalSize"]["height"] * 2

def test_different_image_formats():
    """Test enhancement with different image formats"""
    formats = [
        ('JPEG', 'image/jpeg', 'jpg'),
        ('PNG', 'image/png', 'png'),
        ('WEBP', 'image/webp', 'webp')
    ]
    
    for format_name, mime_type, extension in formats:
        test_image = create_test_image(100, 100, format_name, 'purple')
        files = {"file": (f"test.{extension}", test_image, mime_type)}
        data = {"options": json.dumps({"scale": 2, "format": "png"})}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        assert "enhancedImage" in result
        assert result["metadata"]["originalSize"]["width"] == 100
        assert result["metadata"]["originalSize"]["height"] == 100

def test_enhancement_options_combinations():
    """Test different combinations of enhancement options"""
    test_image = create_test_image(100, 100)
    
    option_combinations = [
        {"scale": 2, "noise_reduction": False, "face_enhancement": False, "background_removal": False},
        {"scale": 4, "noise_reduction": True, "face_enhancement": False, "background_removal": False},
        {"scale": 8, "noise_reduction": True, "face_enhancement": True, "background_removal": False},
        {"scale": 2, "noise_reduction": False, "face_enhancement": False, "background_removal": True},
    ]
    
    for i, options in enumerate(option_combinations):
        files = {"file": (f"test{i}.jpg", test_image, "image/jpeg")}
        data = {"options": json.dumps(options)}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        assert "enhancedImage" in result
        
        # Verify options were applied
        metadata = result["metadata"]
        assert metadata["options"]["scale"] == options["scale"]
        assert metadata["options"]["noise_reduction"] == options["noise_reduction"]
        assert metadata["options"]["face_enhancement"] == options["face_enhancement"]
        assert metadata["options"]["background_removal"] == options["background_removal"]

def test_error_handling_workflow():
    """Test error handling throughout the workflow"""
    # Test with invalid file
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    data = {"options": json.dumps({"scale": 2})}
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 400
    
    # Test with invalid options
    test_image = create_test_image(100, 100)
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": json.dumps({"scale": 20})}  # Invalid scale
    
    response = client.post("/api/enhance", files=files, data=data)
    assert response.status_code == 422
    
    # Test with missing file
    data = {"options": json.dumps({"scale": 2})}
    response = client.post("/api/enhance", data=data)
    assert response.status_code == 400
    
    # Test with missing options
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    response = client.post("/api/enhance", files=files)
    assert response.status_code == 400

def test_batch_error_handling():
    """Test error handling in batch processing"""
    # Mix of valid and invalid files
    test_images = [
        ("valid.jpg", create_test_image(100, 100), "image/jpeg"),
        ("invalid.txt", b"not an image", "text/plain"),
        ("valid2.jpg", create_test_image(100, 100), "image/jpeg")
    ]
    
    files = [("files", img) for _, img, _ in test_images]
    data = {"options": json.dumps({"scale": 2})}
    
    response = client.post("/api/enhance/batch", files=files, data=data)
    assert response.status_code == 200
    
    result = response.json()
    assert result["totalProcessed"] == 2
    assert result["totalFailed"] == 1
    
    # Check individual results
    results = result["results"]
    assert results[0]["success"] == True
    assert results[1]["success"] == False
    assert results[2]["success"] == True

def test_api_consistency():
    """Test API consistency across different requests"""
    test_image = create_test_image(100, 100)
    
    # Make multiple requests with same parameters
    for i in range(3):
        files = {"file": (f"test{i}.jpg", test_image, "image/jpeg")}
        data = {"options": json.dumps({"scale": 2, "format": "png"})}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200
        
        result = response.json()
        assert "enhancedImage" in result
        assert "metadata" in result
        
        # Verify consistent response structure
        metadata = result["metadata"]
        assert "originalSize" in metadata
        assert "enhancedSize" in metadata
        assert "fileSize" in metadata
        assert "processingTime" in metadata
        assert "options" in metadata

def test_concurrent_requests_integration():
    """Test handling of concurrent requests in integration scenario"""
    import threading
    import queue
    
    results = queue.Queue()
    
    def make_request(request_id):
        test_image = create_test_image(100, 100)
        files = {"file": (f"test{request_id}.jpg", test_image, "image/jpeg")}
        data = {"options": json.dumps({"scale": 2, "format": "png"})}
        
        response = client.post("/api/enhance", files=files, data=data)
        results.put({
            'request_id': request_id,
            'status_code': response.status_code,
            'success': response.status_code == 200
        })
    
    # Start 5 concurrent requests
    threads = []
    for i in range(5):
        thread = threading.Thread(target=make_request, args=(i,))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check results
    assert results.qsize() == 5
    
    successful_requests = 0
    while not results.empty():
        result = results.get()
        if result['success']:
            successful_requests += 1
    
    # All requests should succeed
    assert successful_requests == 5

if __name__ == "__main__":
    pytest.main([__file__, "-v"])