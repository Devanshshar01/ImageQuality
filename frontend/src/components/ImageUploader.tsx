'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export default function ImageUploader({
  onImagesChange,
  maxFiles = 5,
  maxSize = 30 * 1024 * 1024, // 30MB
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff']
}: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = acceptedTypes.includes(file.type);
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== acceptedFiles.length) {
      alert(`Some files were rejected. Please ensure files are images and under ${Math.round(maxSize / 1024 / 1024)}MB.`);
    }

    onImagesChange(validFiles);
  }, [onImagesChange, maxSize, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes.map(type => `.${type.split('/')[1]}`)
    },
    multiple: true,
    maxFiles,
    maxSize
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive && !isDragReject
          ? "border-cyan-400 bg-cyan-400/10 scale-105"
          : isDragReject
          ? "border-red-400 bg-red-400/10"
          : "border-gray-400 hover:border-cyan-400 hover:bg-cyan-400/5"
      )}
    >
      <input {...getInputProps()} />
      
      <motion.div
        animate={{ 
          scale: isDragActive ? 1.1 : 1,
          rotate: isDragActive ? 5 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        {isDragActive ? (
          <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
        ) : (
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        )}
      </motion.div>

      <motion.p 
        className="text-lg text-gray-300 mb-2"
        animate={{ color: isDragActive ? '#22d3ee' : '#d1d5db' }}
      >
        {isDragActive 
          ? 'Drop images here' 
          : 'Drag & drop images or click to browse'
        }
      </motion.p>
      
      <p className="text-sm text-gray-400">
        Supports PNG, JPG, JPEG, WebP, BMP, TIFF
        <br />
        Max {Math.round(maxSize / 1024 / 1024)}MB each, up to {maxFiles} images
      </p>

      {isDragReject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-400 text-sm"
        >
          Some files are not supported
        </motion.div>
      )}
    </div>
  );
}