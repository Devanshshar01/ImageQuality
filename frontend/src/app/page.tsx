'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Settings, 
  Zap, 
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import ImageComparison from '@/components/ImageComparison';
import EnhancementOptions from '@/components/EnhancementOptions';
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

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingImage, setCurrentProcessingImage] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState({
    scale: 4,
    noiseReduction: true,
    faceEnhancement: false,
    backgroundRemoval: false,
    format: 'png' as 'png' | 'jpg'
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 30 * 1024 * 1024; // 30MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== acceptedFiles.length) {
      alert('Some files were rejected. Please ensure files are images and under 30MB.');
    }

    setImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff']
    },
    multiple: true,
    maxFiles: 5
  });

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const enhanceImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setEnhancedImages([]);

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setCurrentProcessingImage(image.name);
        
        const formData = new FormData();
        formData.append('file', image);
        formData.append('options', JSON.stringify(enhancementOptions));

        const response = await fetch('/api/enhance', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to enhance ${image.name}`);
        }

        const result = await response.json();
        
        setEnhancedImages(prev => [...prev, {
          id: `${image.name}-${Date.now()}`,
          original: URL.createObjectURL(image),
          enhanced: result.enhancedImage,
          metadata: result.metadata
        }]);

        setProcessingProgress(((i + 1) / images.length) * 100);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentProcessingImage('');
    }
  };

  const downloadImage = (enhancedImage: EnhancedImage) => {
    const link = document.createElement('a');
    link.href = enhancedImage.enhanced;
    link.download = `enhanced_${enhancedImage.id}.${enhancementOptions.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            AI Image Enhancer
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Transform your images to 8K quality with AI-powered enhancement
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">8K</div>
              <div className="text-sm text-gray-400">Resolution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-gray-400">Free</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">No</div>
              <div className="text-sm text-gray-400">Watermark</div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Upload Images</h2>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-400/30 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Options
                  </button>
                </div>

                {/* Enhancement Options */}
                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <EnhancementOptions
                        options={enhancementOptions}
                        onChange={setEnhancementOptions}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload Area */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                    isDragActive 
                      ? "border-cyan-400 bg-cyan-400/10" 
                      : "border-gray-400 hover:border-cyan-400 hover:bg-cyan-400/5"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-300 mb-2">
                    {isDragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports PNG, JPG, JPEG, WebP (max 30MB each, up to 5 images)
                  </p>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Selected Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={image.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhance Button */}
                {images.length > 0 && (
                  <motion.button
                    onClick={enhanceImages}
                    disabled={isProcessing}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing... {Math.round(processingProgress)}%
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Enhance Images
                      </>
                    )}
                  </motion.button>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enhancing: {currentProcessingImage}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Results</h2>
                
                {enhancedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">Enhanced images will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enhancedImages.map((enhancedImage) => (
                      <div key={enhancedImage.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300 truncate">
                            {enhancedImage.id.split('-')[0]}
                          </span>
                          <button
                            onClick={() => downloadImage(enhancedImage)}
                            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4 text-cyan-400" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>
                            {enhancedImage.metadata.originalSize.width}×{enhancedImage.metadata.originalSize.height} → 
                            {enhancedImage.metadata.enhancedSize.width}×{enhancedImage.metadata.enhancedSize.height}
                          </div>
                          <div>Processed in {enhancedImage.metadata.processingTime}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Image Comparison */}
          {enhancedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <ImageComparison images={enhancedImages} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}