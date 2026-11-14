import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const handleAnalyze = (e) => {
    e.preventDefault();
    // Backend functionality will be connected here
    console.log('Analyze triggered:', { message, link });
  };

  return (
    <div className="app-container">
      {/* Navigation / Header */}
      <header className="navbar">
        <div className="brand">
          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="brand-name">ScamShield</span>
          <span className="brand-badge">AI Detector</span>
        </div>
      </header>

      {/* Main Hero & Scanner Content */}
      <main className="main-content">
        <section className="hero-section">
          <div className="pill-badge">
            <span className="pill-dot"></span>
            Real-Time Scam Detection
          </div>
          <h1 className="hero-headline">Before You Click, Check It.</h1>
          <p className="hero-description">
            Received a suspicious message, SMS, or link? Paste it below to analyze
            it for phishing attempts, fraud signals, and dangerous links before you take action.
          </p>
        </section>

        {/* Scanner Card */}
        <div className="scanner-card">
          <form onSubmit={handleAnalyze} className="scanner-form">
            {/* Suspicious Message Input */}
            <div className="form-group">
              <label htmlFor="message-input" className="form-label">
                Suspicious Message
                <span className="required-indicator">*</span>
              </label>
              <textarea
                id="message-input"
                className="form-textarea"
                rows={6}
                placeholder="Paste the suspicious SMS, WhatsApp message, email, or DM here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Suspicious Link Input */}
            <div className="form-group">
              <div className="label-wrapper">
                <label htmlFor="link-input" className="form-label">
                  Suspicious Link
                </label>
                <span className="optional-tag">Optional</span>
              </div>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <input
                  id="link-input"
                  type="url"
                  className="form-input"
                  placeholder="https://example-suspicious-website.com/verify"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            {/* Privacy Alert */}
            <div className="privacy-note" role="note">
              <svg
                className="privacy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p>
                <strong>Privacy Notice:</strong> For your security, avoid entering sensitive
                information such as personal passwords, banking details, or OTPs.
              </p>
            </div>

            {/* Action Button */}
            <div className="action-area">
              <button type="submit" className="analyze-button">
                <span>Analyze Now</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights / Trust Badges */}
        <section className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <h3>Phishing Detection</h3>
            <p>Identifies fake domains, deceptive URLs, and credential harvesters.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Urgency & Fear Tactics</h3>
            <p>Spots artificial panic such as fake parcel delivery and bank suspensions.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Deep Scam Analysis</h3>
            <p>Evaluates impersonation patterns and common fraudulent language.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} ScamShield. Built for rapid scam prevention.</p>
      </footer>
    </div>
  );
}

export default App;
