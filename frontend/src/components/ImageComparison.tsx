'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, Maximize2 } from 'lucide-react';
import CompareImage from 'react-compare-image';
import { cn } from '@/lib/utils';

interface EnhancedImage {
  id: string;
  original: string;
  enhanced: string;
  metadata: {
    originalSize: { width: number; height: number };
    enhancedSize: { width: number; height: number };
    fileSize: number;
    processingTime: number;
  };
}

interface ImageComparisonProps {
  images: EnhancedImage[];
}

export default function ImageComparison({ images }: ImageComparisonProps) {
  const [selectedImage, setSelectedImage] = useState<EnhancedImage | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const downloadImage = (image: EnhancedImage) => {
    const link = document.createElement('a');
    link.href = image.enhanced;
    link.download = `enhanced_${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadOriginal = (image: EnhancedImage) => {
    const link = document.createElement('a');
    link.href = image.original;
    link.download = `original_${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Image Comparison</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-400/30 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-white/5 rounded-lg p-4 cursor-pointer transition-all duration-300",
              selectedImage?.id === image.id 
                ? "ring-2 ring-cyan-400 bg-cyan-400/10" 
                : "hover:bg-white/10"
            )}
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden">
              <img
                src={image.enhanced}
                alt="Enhanced"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-300 truncate">
                {image.id.split('-')[0]}
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>
                  {image.metadata.originalSize.width}×{image.metadata.originalSize.height} → 
                  {image.metadata.enhancedSize.width}×{image.metadata.enhancedSize.height}
                </div>
                <div>Processed in {image.metadata.processingTime}s</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image);
                  }}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadOriginal(image);
                  }}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 text-xs py-2 px-3 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Comparison */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "bg-white/5 rounded-xl p-6",
            isFullscreen && "fixed inset-4 z-50 bg-slate-900/95 backdrop-blur-lg"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedImage.id.split('-')[0]} - Before/After Comparison
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => downloadImage(selectedImage)}
                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-400/30 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg border border-gray-400/30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <CompareImage
              leftImage={selectedImage.original}
              rightImage={selectedImage.enhanced}
              leftImageLabel="Original"
              rightImageLabel="Enhanced"
              sliderLineColor="#22d3ee"
              sliderPositionPercentage={0.5}
              hover={true}
              skeleton={{
                width: '100%',
                height: '400px',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {selectedImage.metadata.originalSize.width}×{selectedImage.metadata.originalSize.height}
              </div>
              <div className="text-sm text-gray-400">Original Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {selectedImage.metadata.enhancedSize.width}×{selectedImage.metadata.enhancedSize.height}
              </div>
              <div className="text-sm text-gray-400">Enhanced Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {Math.round((selectedImage.metadata.enhancedSize.width / selectedImage.metadata.originalSize.width) * 100) / 100}x
              </div>
              <div className="text-sm text-gray-400">Upscale Factor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {selectedImage.metadata.processingTime}s
              </div>
              <div className="text-sm text-gray-400">Processing Time</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}