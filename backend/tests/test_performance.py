import pytest
import time
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

def test_single_image_performance():
    """Test performance of single image enhancement"""
    test_image = create_test_image(500, 500)
    
    files = {"file": ("test.jpg", test_image, "image/jpeg")}
    data = {"options": '{"scale": 4, "noise_reduction": true, "format": "png"}'}
    
    start_time = time.time()
    response = client.post("/api/enhance", files=files, data=data)
    end_time = time.time()
    
    assert response.status_code == 200
    processing_time = end_time - start_time
    
    # Should complete within reasonable time (30 seconds for demo)
    assert processing_time < 30, f"Processing took too long: {processing_time:.2f}s"
    
    print(f"Single image processing time: {processing_time:.2f}s")

def test_batch_performance():
    """Test performance of batch image enhancement"""
    test_images = [
        ("image1.jpg", create_test_image(200, 200), "image/jpeg"),
        ("image2.jpg", create_test_image(300, 300), "image/jpeg"),
        ("image3.jpg", create_test_image(250, 250), "image/jpeg")
    ]
    
    files = [("files", img) for _, img, _ in test_images]
    data = {"options": '{"scale": 2, "format": "png"}'}
    
    start_time = time.time()
    response = client.post("/api/enhance/batch", files=files, data=data)
    end_time = time.time()
    
    assert response.status_code == 200
    processing_time = end_time - start_time
    
    # Should complete within reasonable time (60 seconds for demo)
    assert processing_time < 60, f"Batch processing took too long: {processing_time:.2f}s"
    
    print(f"Batch processing time: {processing_time:.2f}s")

def test_different_scales_performance():
    """Test performance with different scale factors"""
    scales = [2, 4, 8]
    test_image = create_test_image(200, 200)
    
    for scale in scales:
        files = {"file": ("test.jpg", test_image, "image/jpeg")}
        data = {"options": f'{{"scale": {scale}, "format": "png"}}'}
        
        start_time = time.time()
        response = client.post("/api/enhance", files=files, data=data)
        end_time = time.time()
        
        assert response.status_code == 200
        processing_time = end_time - start_time
        
        print(f"Scale {scale}x processing time: {processing_time:.2f}s")
        
        # Higher scales should take longer
        if scale > 2:
            assert processing_time > 1, f"Scale {scale}x should take longer than 1s"

def test_memory_usage():
    """Test memory usage during processing"""
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    
    # Process multiple images
    for i in range(5):
        test_image = create_test_image(300, 300)
        files = {"file": (f"test{i}.jpg", test_image, "image/jpeg")}
        data = {"options": '{"scale": 4, "format": "png"}'}
        
        response = client.post("/api/enhance", files=files, data=data)
        assert response.status_code == 200
        
        current_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = current_memory - initial_memory
        
        print(f"Memory usage after {i+1} images: {current_memory:.1f}MB (+{memory_increase:.1f}MB)")
        
        # Memory increase should be reasonable (less than 100MB per image)
        assert memory_increase < 100, f"Memory usage too high: {memory_increase:.1f}MB"

def test_concurrent_requests():
    """Test handling of concurrent requests"""
    import threading
    import queue
    
    results = queue.Queue()
    
    def process_image(image_id):
        test_image = create_test_image(200, 200)
        files = {"file": (f"test{image_id}.jpg", test_image, "image/jpeg")}
        data = {"options": '{"scale": 2, "format": "png"}'}
        
        start_time = time.time()
        response = client.post("/api/enhance", files=files, data=data)
        end_time = time.time()
        
        results.put({
            'image_id': image_id,
            'status_code': response.status_code,
            'processing_time': end_time - start_time
        })
    
    # Start 3 concurrent requests
    threads = []
    for i in range(3):
        thread = threading.Thread(target=process_image, args=(i,))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check results
    assert results.qsize() == 3
    
    total_time = 0
    while not results.empty():
        result = results.get()
        assert result['status_code'] == 200
        total_time = max(total_time, result['processing_time'])
        print(f"Image {result['image_id']} processed in {result['processing_time']:.2f}s")
    
    print(f"Total concurrent processing time: {total_time:.2f}s")

def test_large_image_performance():
    """Test performance with large images"""
    large_image = create_test_image(1000, 1000)
    
    files = {"file": ("large.jpg", large_image, "image/jpeg")}
    data = {"options": '{"scale": 2, "format": "png"}'}
    
    start_time = time.time()
    response = client.post("/api/enhance", files=files, data=data)
    end_time = time.time()
    
    assert response.status_code == 200
    processing_time = end_time - start_time
    
    print(f"Large image (1000x1000) processing time: {processing_time:.2f}s")
    
    # Should complete within reasonable time
    assert processing_time < 45, f"Large image processing took too long: {processing_time:.2f}s"

def test_api_response_time():
    """Test API response time for health checks"""
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == 200
    response_time = end_time - start_time
    
    # Health check should be very fast
    assert response_time < 1, f"Health check too slow: {response_time:.3f}s"
    
    print(f"Health check response time: {response_time:.3f}s")

def test_models_endpoint_performance():
    """Test models endpoint performance"""
    start_time = time.time()
    response = client.get("/api/models")
    end_time = time.time()
    
    assert response.status_code == 200
    response_time = end_time - start_time
    
    # Models endpoint should be fast
    assert response_time < 2, f"Models endpoint too slow: {response_time:.3f}s"
    
    print(f"Models endpoint response time: {response_time:.3f}s")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])