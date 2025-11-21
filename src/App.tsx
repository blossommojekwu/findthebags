import React, { FC, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCamera } from 'react-icons/fi'
import { analyzeImage } from './services/visionService'
import './App.css'

// Global variable to store the uploaded image
let uploadedImage: File | null = null

interface VisionAnalysis {
  labels: Array<{ description: string; confidence: string }>;
  text: string;
  safeSearch: {
    adult: string;
    violence: string;
    racy: string;
  };
  colors: Array<{ color: string; percentage: string }>;
  objects: Array<{ name: string; confidence: string }>;
}

const App: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const imageErrorToast = () => toast("Please upload an image file");
  const uploadSuccessToast = () => toast("Image uploaded successfully!");
  const analysisLoadingToast = () => toast("Analyzing image...");
  const analysisSuccessToast = () => toast("Analysis complete!");
  const analysisErrorToast = (error: string) => toast(`Analysis failed: ${error}`);

  const analyzeImageWithVision = async () => {
    if (!uploadedImage) {
      toast("Please upload an image first");
      return;
    }

    const apiKey = (import.meta as any).env.VITE_GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      toast("Google Vision API key not configured");
      return;
    }

    setIsAnalyzing(true);
    analysisLoadingToast();

    try {
      const analysis = await analyzeImage(uploadedImage, apiKey);
      setVisionAnalysis(analysis);
      analysisSuccessToast();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Vision analysis error:', error);
      analysisErrorToast(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const processImage = (file: File) => {
    // Validate that it's an image
    if (!file.type.startsWith('image/')) {
      console.warn('Please upload an image file');
      imageErrorToast();
      return
    }

    // Save to global variable
    uploadedImage = file
    console.log('Image saved globally:', uploadedImage.name, uploadedImage.type)
    uploadSuccessToast();

    // Clear previous analysis
    setVisionAnalysis(null);

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      console.log('Image preview ready')
    }
    reader.readAsDataURL(file)
  }

  const handleGetStarted = () => {
    fileInputRef.current?.click()

  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processImage(files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processImage(files[0])
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Find the Bags</h1>
        <p>AI-Powered Vintage Bag Recognition</p>
      </header>
      
      <main className="main-content">
        <section className="hero">
          <h2>Welcome to Find the Bags</h2>
          <p>Discover and identify bags using advanced AI recognition technology.</p>
          <div className="upload-container">
            <button
              className={`cta-button ${isDragging ? 'dragging' : ''}`}
              onClick={handleGetStarted}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FiCamera className="button-icon" />
              Upload bag photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Uploaded bag" />
                <p>{uploadedImage?.name}</p>
              </div>
            )}
          </div>
          {imagePreview && (
            <button 
              className="analyze-button" 
              onClick={analyzeImageWithVision}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Bag'}
            </button>
          )}
          {visionAnalysis && (
            <div className='bag-info'>
              <h3>AI Analysis Results</h3>
              
              {/* Objects Detection */}
              {visionAnalysis.objects.length > 0 && (
                <div className="analysis-section">
                  <h4>Objects Detected</h4>
                  <div className="analysis-items">
                    {visionAnalysis.objects.map((obj, idx) => (
                      <div key={idx} className="analysis-item">
                        <span className="item-name">{obj.name}</span>
                        <span className="item-confidence">{obj.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {visionAnalysis.labels.length > 0 && (
                <div className="analysis-section">
                  <h4>Identified Features</h4>
                  <div className="analysis-items">
                    {visionAnalysis.labels.map((label, idx) => (
                      <div key={idx} className="analysis-item">
                        <span className="item-name">{label.description}</span>
                        <span className="item-confidence">{label.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Detection */}
              {visionAnalysis.text && (
                <div className="analysis-section">
                  <h4>Text Detected</h4>
                  <p className="detected-text">{visionAnalysis.text}</p>
                </div>
              )}

              {/* Colors */}
              {visionAnalysis.colors.length > 0 && (
                <div className="analysis-section">
                  <h4>Dominant Colors</h4>
                  <div className="color-palette">
                    {visionAnalysis.colors.map((colorInfo, idx) => (
                      <div key={idx} className="color-item">
                        <div 
                          className="color-box" 
                          style={{ backgroundColor: colorInfo.color }}
                          title={colorInfo.color}
                        />
                        <span className="color-percentage">{colorInfo.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Brand & Bag Information */}
              {visionAnalysis.bagBrandInfo && (
                <div className="analysis-section">
                  <h4>🎒 Handbag Identification</h4>
                  <div className="brand-info">
                    <p className="handbag-status">
                      <strong>Handbag Detected:</strong> {visionAnalysis.bagBrandInfo.handbagConfidence}% confidence
                    </p>
                    
                    {visionAnalysis.bagBrandInfo.brands.length > 0 && (
                      <div className="brands-list">
                        <h5>Detected Brands/Logos:</h5>
                        <ul>
                          {visionAnalysis.bagBrandInfo.brands.map((brand: any, idx: number) => (
                            <li key={idx}>
                              <span className="brand-name">{brand.description}</span>
                              <span className="brand-confidence">{brand.confidence}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {visionAnalysis.bagBrandInfo.webResults.length > 0 && (
                      <div className="web-results">
                        <h5>Similar Bags & Brands Found:</h5>
                        <ul>
                          {visionAnalysis.bagBrandInfo.webResults.map((result: any, idx: number) => (
                            <li key={idx}>
                              {result.url ? (
                                <a href={result.url} target="_blank" rel="noopener noreferrer">
                                  {result.title}
                                </a>
                              ) : (
                                <span>{result.title}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety Check */}
              <div className="analysis-section">
                <h4>Content Analysis</h4>
                <div className="safety-check">
                  <p><strong>Adult Content:</strong> {visionAnalysis.safeSearch.adult}</p>
                  <p><strong>Violence:</strong> {visionAnalysis.safeSearch.violence}</p>
                  <p><strong>Racy Content:</strong> {visionAnalysis.safeSearch.racy}</p>
                </div>
              </div>
            </div>
          )}
        </section>
        
        <section className="features">
          <div className="feature-card">
            <h3>Fast Recognition</h3>
            <p>Instantly identify bags with our advanced AI algorithm.</p>
          </div>
          <div className="feature-card">
            <h3>Accurate Results</h3>
            <p>High-precision detection for various bag types and styles.</p>
          </div>
          <div className="feature-card">
            <h3>Easy to Use</h3>
            <p>Simple and intuitive interface for quick bag identification.</p>
          </div>
        </section>
      </main>
      
      <footer className="footer">
        <p>&copy; 2025 Find the Bags. All rights reserved.</p>
      </footer>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
