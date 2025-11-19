import React, { FC } from 'react'
import './App.css'

const App: FC = () => {
  return (
    <div className="app">
      <header className="header">
        <h1>Find the Bags</h1>
        <p>AI-Powered Bag Recognition</p>
      </header>
      
      <main className="main-content">
        <section className="hero">
          <h2>Welcome to Find the Bags</h2>
          <p>Discover and identify bags using advanced AI recognition technology.</p>
          <button className="cta-button">Get Started</button>
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
