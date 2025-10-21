from pydantic import BaseModel, Field
from typing import Literal

class EnhancementOptions(BaseModel):
    """Enhancement options for image processing"""
    
    scale: int = Field(
        default=4,
        ge=1,
        le=8,
        description="Upscaling factor (1-8x)"
    )
    
    noise_reduction: bool = Field(
        default=True,
        description="Enable noise reduction"
    )
    
    face_enhancement: bool = Field(
        default=False,
        description="Enable face enhancement (GFPGAN)"
    )
    
    background_removal: bool = Field(
        default=False,
        description="Enable background removal (U2Net)"
    )
    
    format: Literal["png", "jpg"] = Field(
        default="png",
        description="Output image format"
    )
    
    quality: int = Field(
        default=95,
        ge=1,
        le=100,
        description="JPEG quality (1-100)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "scale": 4,
                "noise_reduction": True,
                "face_enhancement": False,
                "background_removal": False,
                "format": "png",
                "quality": 95
            }
        }