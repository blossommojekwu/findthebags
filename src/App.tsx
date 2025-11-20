import React, { FC, useRef, useState } from 'react'
import { FiCamera } from 'react-icons/fi'
import './App.css'

// Global variable to store the uploaded image
let uploadedImage: File | null = null

const App: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const processImage = (file: File) => {
    // Validate that it's an image
    if (!file.type.startsWith('image/')) {
      console.warn('Please upload an image file')
      return
    }

    // Save to global variable
    uploadedImage = file
    console.log('Image saved globally:', uploadedImage.name, uploadedImage.type)

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
          <div className='bag-info'>
            

          </div>
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
    </div>
  )
}

export default App
