'use client';

import { motion } from 'framer-motion';
import { Settings, Zap, Eye, Trash2, Download } from 'lucide-react';

interface EnhancementOptions {
  scale: number;
  noiseReduction: boolean;
  faceEnhancement: boolean;
  backgroundRemoval: boolean;
  format: 'png' | 'jpg';
}

interface EnhancementOptionsProps {
  options: EnhancementOptions;
  onChange: (options: EnhancementOptions) => void;
}

export default function EnhancementOptions({ options, onChange }: EnhancementOptionsProps) {
  const scaleOptions = [
    { value: 2, label: '2x', description: 'Double resolution' },
    { value: 4, label: '4x', description: 'Quadruple resolution' },
    { value: 8, label: '8x', description: '8x resolution (8K)' }
  ];

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Lossless quality' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white/5 rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Enhancement Options</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scale Factor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <Zap className="w-4 h-4 inline mr-2" />
            Scale Factor
          </label>
          <div className="space-y-2">
            {scaleOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  options.scale === option.value
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="scale"
                  value={option.value}
                  checked={options.scale === option.value}
                  onChange={(e) => onChange({ ...options, scale: parseInt(e.target.value) })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </div>
                {options.scale === option.value && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <Download className="w-4 h-4 inline mr-2" />
            Output Format
          </label>
          <div className="space-y-2">
            {formatOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  options.format === option.value
                    ? 'border-purple-400 bg-purple-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={option.value}
                  checked={options.format === option.value}
                  onChange={(e) => onChange({ ...options, format: e.target.value as 'png' | 'jpg' })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </div>
                {options.format === option.value && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Enhancement Features */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            <Eye className="w-4 h-4 inline mr-2" />
            Enhancement Features
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center p-4 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-all duration-200">
              <input
                type="checkbox"
                checked={options.noiseReduction}
                onChange={(e) => onChange({ ...options, noiseReduction: e.target.checked })}
                className="w-4 h-4 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
              />
              <div className="ml-3">
                <div className="font-medium text-white">Noise Reduction</div>
                <div className="text-sm text-gray-400">Remove image noise</div>
              </div>
            </label>

            <label className="flex items-center p-4 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-all duration-200">
              <input
                type="checkbox"
                checked={options.faceEnhancement}
                onChange={(e) => onChange({ ...options, faceEnhancement: e.target.checked })}
                className="w-4 h-4 text-purple-400 bg-gray-700 border-gray-600 rounded focus:ring-purple-400 focus:ring-2"
              />
              <div className="ml-3">
                <div className="font-medium text-white">Face Enhancement</div>
                <div className="text-sm text-gray-400">Improve facial details</div>
              </div>
            </label>

            <label className="flex items-center p-4 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-all duration-200">
              <input
                type="checkbox"
                checked={options.backgroundRemoval}
                onChange={(e) => onChange({ ...options, backgroundRemoval: e.target.checked })}
                className="w-4 h-4 text-pink-400 bg-gray-700 border-gray-600 rounded focus:ring-pink-400 focus:ring-2"
              />
              <div className="ml-3">
                <div className="font-medium text-white">Background Removal</div>
                <div className="text-sm text-gray-400">Remove background</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({
              scale: 4,
              noiseReduction: true,
              faceEnhancement: false,
              backgroundRemoval: false,
              format: 'png'
            })}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm rounded-lg border border-cyan-400/30 transition-colors"
          >
            High Quality
          </button>
          <button
            onClick={() => onChange({
              scale: 8,
              noiseReduction: true,
              faceEnhancement: true,
              backgroundRemoval: false,
              format: 'png'
            })}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm rounded-lg border border-purple-400/30 transition-colors"
          >
            Maximum Quality
          </button>
          <button
            onClick={() => onChange({
              scale: 2,
              noiseReduction: false,
              faceEnhancement: false,
              backgroundRemoval: false,
              format: 'jpg'
            })}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 text-sm rounded-lg border border-gray-400/30 transition-colors"
          >
            Fast Processing
          </button>
        </div>
      </div>
    </motion.div>
  );
}