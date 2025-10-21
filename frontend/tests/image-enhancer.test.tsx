import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock the API
global.fetch = jest.fn();

describe('AI Image Enhancer', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders main heading', () => {
    render(<Home />);
    expect(screen.getByText('AI Image Enhancer')).toBeInTheDocument();
  });

  test('renders upload area', () => {
    render(<Home />);
    expect(screen.getByText(/Drag & drop images or click to browse/)).toBeInTheDocument();
  });

  test('shows enhancement options when options button is clicked', () => {
    render(<Home />);
    const optionsButton = screen.getByText('Options');
    fireEvent.click(optionsButton);
    
    expect(screen.getByText('Enhancement Options')).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    render(<Home />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Selected Images')).toBeInTheDocument();
    });
  });

  test('shows error for invalid file type', async () => {
    render(<Home />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Some files were rejected')
      );
    });

    alertSpy.mockRestore();
  });

  test('shows error for file too large', async () => {
    render(<Home />);
    
    // Create a large file (simulate)
    const largeFile = new File(['x'.repeat(31 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [largeFile]
      }
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Some files were rejected')
      );
    });

    alertSpy.mockRestore();
  });

  test('enhances images when enhance button is clicked', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        enhancedImage: 'data:image/png;base64,test',
        metadata: {
          originalSize: { width: 100, height: 100 },
          enhancedSize: { width: 400, height: 400 },
          fileSize: 1024,
          processingTime: 2.5,
          options: { scale: 4, noise_reduction: true }
        }
      })
    });

    render(<Home />);
    
    // Upload a file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Selected Images')).toBeInTheDocument();
    });

    // Click enhance button
    const enhanceButton = screen.getByText('Enhance Images');
    fireEvent.click(enhanceButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/enhance', {
        method: 'POST',
        body: expect.any(FormData)
      });
    });
  });

  test('shows processing status during enhancement', async () => {
    // Mock API response with delay
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            enhancedImage: 'data:image/png;base64,test',
            metadata: {
              originalSize: { width: 100, height: 100 },
              enhancedSize: { width: 400, height: 400 },
              fileSize: 1024,
              processingTime: 2.5,
              options: { scale: 4, noise_reduction: true }
            }
          })
        }), 100)
      )
    );

    render(<Home />);
    
    // Upload a file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Selected Images')).toBeInTheDocument();
    });

    // Click enhance button
    const enhanceButton = screen.getByText('Enhance Images');
    fireEvent.click(enhanceButton);

    // Check processing status
    expect(screen.getByText(/Processing.../)).toBeInTheDocument();
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  test('handles enhancement error', async () => {
    // Mock API error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Enhancement failed'));

    render(<Home />);
    
    // Upload a file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Selected Images')).toBeInTheDocument();
    });

    // Click enhance button
    const enhanceButton = screen.getByText('Enhance Images');
    fireEvent.click(enhanceButton);

    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Enhancement failed. Please try again.');
    });

    alertSpy.mockRestore();
  });

  test('removes image when remove button is clicked', async () => {
    render(<Home />);
    
    // Upload a file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /Drag & drop images or click to browse/ });
    
    fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Selected Images')).toBeInTheDocument();
    });

    // Click remove button
    const removeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Selected Images')).not.toBeInTheDocument();
    });
  });

  test('updates enhancement options', () => {
    render(<Home />);
    
    // Open options
    const optionsButton = screen.getByText('Options');
    fireEvent.click(optionsButton);

    // Change scale to 8x
    const scale8Button = screen.getByText('8x');
    fireEvent.click(scale8Button);

    // Change format to JPG
    const jpgButton = screen.getByText('JPG');
    fireEvent.click(jpgButton);

    // Enable face enhancement
    const faceEnhancementCheckbox = screen.getByLabelText('Face Enhancement');
    fireEvent.click(faceEnhancementCheckbox);

    // Verify options are updated
    expect(scale8Button.closest('label')).toHaveClass('border-cyan-400');
    expect(jpgButton.closest('label')).toHaveClass('border-purple-400');
    expect(faceEnhancementCheckbox).toBeChecked();
  });

  test('applies preset configurations', () => {
    render(<Home />);
    
    // Open options
    const optionsButton = screen.getByText('Options');
    fireEvent.click(optionsButton);

    // Click High Quality preset
    const highQualityButton = screen.getByText('High Quality');
    fireEvent.click(highQualityButton);

    // Verify options are set correctly
    const scale4Button = screen.getByText('4x');
    const pngButton = screen.getByText('PNG');
    const noiseReductionCheckbox = screen.getByLabelText('Noise Reduction');

    expect(scale4Button.closest('label')).toHaveClass('border-cyan-400');
    expect(pngButton.closest('label')).toHaveClass('border-purple-400');
    expect(noiseReductionCheckbox).toBeChecked();
  });
});