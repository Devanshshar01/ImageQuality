# AI Image Quality Enhancer 8K

A full-stack web application that enhances low-resolution or blurry images up to 8K resolution using free, open-source AI upscaling models. No watermarks, no paid APIs - completely free and open source.

## Features

- 🚀 **8K Image Enhancement** - Upscale images up to 8K resolution
- 🎨 **Real-ESRGAN + GFPGAN** - State-of-the-art AI models for texture and face enhancement
- 📱 **Modern UI** - Glassmorphism design with dark/light mode
- 📁 **Drag & Drop** - Easy image upload with validation
- 🔄 **Before/After Comparison** - Interactive slider to compare results
- ⚡ **Batch Processing** - Process up to 5 images simultaneously
- 💾 **Download Results** - Save enhanced images in PNG or JPG format
- 🆓 **100% Free** - No watermarks, no paid APIs

## Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **AI Models**: Real-ESRGAN + GFPGAN
- **Storage**: Local file system (temporary)

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- CUDA-compatible GPU (recommended for faster processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd image-enhancer-ai
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

3. Download AI models:
```bash
cd backend
python download_models.py
```

4. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Image**: Drag and drop an image or click to browse
2. **Select Options**: Choose scaling level (2x, 4x, 8x) and enhancement options
3. **Enhance**: Click "Enhance Image" to start processing
4. **Compare**: Use the slider to compare before/after results
5. **Download**: Save your enhanced image

## API Endpoints

- `POST /api/enhance` - Enhance a single image
- `POST /api/enhance/batch` - Enhance multiple images
- `GET /api/models` - Get available models and options

## Models Used

- **Real-ESRGAN**: General image super-resolution
- **GFPGAN**: Face enhancement and restoration
- **U2Net**: Background removal (optional)

## Performance Tips

- Use CUDA for GPU acceleration (10x faster)
- Process images in batches for efficiency
- Monitor memory usage with large images
- Use appropriate scaling levels based on input resolution

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) by Xintao Wang
- [GFPGAN](https://github.com/TencentARC/GFPGAN) by Tencent ARC
- [U2Net](https://github.com/xuebinqin/U2-Net) by Xuebin Qin

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.