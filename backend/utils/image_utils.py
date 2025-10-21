import io
from PIL import Image
from typing import Tuple, Optional
from fastapi import UploadFile

def validate_image(file: UploadFile) -> bool:
    """Validate if the uploaded file is a valid image"""
    try:
        # Check file extension
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            return False
        
        # Check MIME type
        allowed_mime_types = {
            'image/png', 'image/jpeg', 'image/jpg', 
            'image/webp', 'image/bmp', 'image/tiff'
        }
        
        if file.content_type not in allowed_mime_types:
            return False
        
        # Check file size (30MB limit)
        max_size = 30 * 1024 * 1024  # 30MB
        if file.size > max_size:
            return False
        
        return True
        
    except Exception:
        return False

def get_image_dimensions(image_data: bytes) -> Tuple[int, int]:
    """Get image dimensions from binary data"""
    try:
        image = Image.open(io.BytesIO(image_data))
        return image.size
    except Exception:
        return (0, 0)

def optimize_image(
    image: Image.Image, 
    max_size: Optional[Tuple[int, int]] = None,
    quality: int = 95
) -> Image.Image:
    """Optimize image for processing"""
    try:
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparent images
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if max_size is specified
        if max_size:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        return image
        
    except Exception as e:
        print(f"Error optimizing image: {e}")
        return image

def calculate_upscaled_dimensions(
    original_width: int, 
    original_height: int, 
    scale: int
) -> Tuple[int, int]:
    """Calculate upscaled dimensions"""
    return (original_width * scale, original_height * scale)

def is_portrait_image(width: int, height: int) -> bool:
    """Check if image is portrait orientation"""
    return height > width

def is_landscape_image(width: int, height: int) -> bool:
    """Check if image is landscape orientation"""
    return width > height

def is_square_image(width: int, height: int) -> bool:
    """Check if image is square"""
    return width == height

def get_aspect_ratio(width: int, height: int) -> float:
    """Get aspect ratio of image"""
    if height == 0:
        return 0
    return width / height

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"