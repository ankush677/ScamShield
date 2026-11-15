import { useState } from 'react';
import './App.css';

const RISK_CONFIG = {
  LOW_RISK: {
    label: 'LOW RISK',
    subtitle: 'No critical scam or phishing indicators identified',
    badgeClass: 'risk-badge-low',
    cardClass: 'verdict-low',
    meterPosition: '16%',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    subtitle: 'Warning signals detected — exercise caution',
    badgeClass: 'risk-badge-medium',
    cardClass: 'verdict-medium',
    meterPosition: '50%',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  LIKELY_SCAM: {
    label: 'LIKELY SCAM',
    subtitle: 'High probability of fraud, phishing, or financial theft',
    badgeClass: 'risk-badge-high',
    cardClass: 'verdict-high',
    meterPosition: '84%',
    color: '#ef4444',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

function App() {
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const loadSample = () => {
    setMessage('URGENT: Your bank account will be blocked within 24 hours due to unverified KYC. Click the link to update your details and verify your OTP immediately.');
    setLink('http://bit.ly/bank-kyc-verify-login');
    setError(null);
  };

  const handleClear = () => {
    setMessage('');
    setLink('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!message.trim() && !link.trim()) {
      setError('Please provide a suspicious message or link to analyze.');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          link: link.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze request.');
      }

      setResult(data);
    } catch (err) {
      console.error('Error connecting to backend:', err);
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        setError('Unable to reach the backend server. Please verify your server is running on http://localhost:5000.');
      } else {
        setError(err.message || 'An unexpected error occurred while communicating with the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reportData = result?.data || null;
  const currentRiskKey = reportData?.riskLevel ? reportData.riskLevel.toUpperCase() : 'SUSPICIOUS';
  const risk = RISK_CONFIG[currentRiskKey] || RISK_CONFIG.SUSPICIOUS;

  return (
    <div className="app-container">
      {/* Top Navbar */}
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
          <span className="brand-badge">SOC AI Engine</span>
        </div>

        <div className="nav-status-group">
          <div className="system-status-pill">
            <span className="live-pulse"></span>
            <span>Live Threat Engine</span>
          </div>
          <button type="button" onClick={loadSample} className="sample-btn" title="Load sample scam to test">
            ⚡ Quick Sample
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="dashboard-main">
        {/* Compact Header Bar */}
        <section className="dashboard-hero">
          <div className="hero-text-container">
            <h1 className="hero-title">
              Before You Click, <span className="highlight-text">Check It.</span>
            </h1>
            <p className="hero-tagline">
              AI-powered threat detection for phishing messages, deceptive URLs & impersonation fraud.
            </p>
          </div>
          <div className="hero-stats-bar">
            <div className="stat-chip">
              <span className="stat-label">Analysis Mode:</span>
              <span className="stat-val">Heuristics + Gemini AI</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Response Time:</span>
              <span className="stat-val">&lt; 1.5s</span>
            </div>
          </div>
        </section>

        {/* 2-Column Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Input Scanner Console */}
          <div className="dashboard-col col-input">
            <div className="console-card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="panel-badge">INPUT CONSOLE</span>
                  <h2 className="card-title">Threat Scanner</h2>
                </div>
                {(message || link) && (
                  <button type="button" onClick={handleClear} className="clear-btn">
                    Clear
                  </button>
                )}
              </div>

              <form onSubmit={handleAnalyze} className="scanner-form">
                {/* Suspicious Message Input */}
                <div className="form-group">
                  <div className="label-wrapper">
                    <label htmlFor="message-input" className="form-label">
                      Suspicious Message Content
                      <span className="required-indicator">*</span>
                    </label>
                    <span className="char-indicator">{message.length} chars</span>
                  </div>
                  <textarea
                    id="message-input"
                    className="form-textarea"
                    rows={6}
                    placeholder="Paste the suspicious SMS, WhatsApp message, email, or DM here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Suspicious Link Input */}
                <div className="form-group">
                  <div className="label-wrapper">
                    <label htmlFor="link-input" className="form-label">
                      Suspicious Link or URL
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
                      placeholder="https://example-suspicious-login.com"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Privacy Warning */}
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
                    <strong>Privacy Note:</strong> Avoid entering sensitive info such as passwords or OTPs.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  className="analyze-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner" aria-hidden="true"></span>
                      <span>Scanning Threat Vectors...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Threat Now</span>
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
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="status-alert error" role="alert">
                  <svg
                    className="status-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="status-content">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Threat Intelligence & Security Report Panel */}
          <div className="dashboard-col col-report">
            {/* Loading Experience: Scanning Radar Animation */}
            {isLoading && (
              <div className="security-scanner-loading" role="status">
                <div className="radar-wrapper">
                  <div className="radar-sweep"></div>
                  <div className="radar-pulse"></div>
                  <div className="radar-center-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
                <div className="scanning-details">
                  <h3 className="scanning-title">Scanning Content For Threats...</h3>
                  <p className="scanning-subtitle">
                    Cross-checking deception heuristics, malicious domains & Gemini AI reasoning
                  </p>
                  <div className="scanning-steps">
                    <span className="step-item active">
                      <span className="step-dot"></span> Heuristic Check
                    </span>
                    <span className="step-item active">
                      <span className="step-dot"></span> URL Inspection
                    </span>
                    <span className="step-item active">
                      <span className="step-dot"></span> Gemini Semantic AI
                    </span>
                  </div>
                  <div className="scanning-progress-bar">
                    <div className="scanning-progress-fill"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State Standby Screen (when no scan is running and no result) */}
            {!isLoading && !reportData && !error && (
              <div className="standby-card">
                <div className="standby-visual">
                  <div className="shield-ring">
                    <svg
                      className="standby-shield"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h3 className="standby-title">Security Intelligence Standby</h3>
                <p className="standby-desc">
                  Paste any message or link on the left to generate an immediate security verdict and risk breakdown.
                </p>

                <div className="detection-matrix">
                  <div className="matrix-item">
                    <div className="matrix-icon">⚡</div>
                    <div className="matrix-info">
                      <h4>Instant Heuristics</h4>
                      <p>Detects urgency, fake KYC, and account suspension threats.</p>
                    </div>
                  </div>
                  <div className="matrix-item">
                    <div className="matrix-icon">🔗</div>
                    <div className="matrix-info">
                      <h4>Domain Verification</h4>
                      <p>Spots deceptive URLs, typosquatting & shortened links.</p>
                    </div>
                  </div>
                  <div className="matrix-item">
                    <div className="matrix-icon">🤖</div>
                    <div className="matrix-info">
                      <h4>Gemini AI Reasoning</h4>
                      <p>Identifies complex impersonation and psychological fraud patterns.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated ScamShield Security Report */}
            {reportData && (
              <div className={`security-report ${risk.cardClass}`} id="security-report">
                {/* Report Header */}
                <div className="report-header">
                  <div className="report-title-group">
                    <span className="report-badge">SECURITY REPORT</span>
                    <h3 className="report-main-title">Threat Assessment Report</h3>
                  </div>
                  <div className="report-meta">
                    <span className="report-meta-tag source-tag">
                      {reportData.analysisSource === 'GEMINI' ? '✨ Gemini AI' : '🛡️ Heuristic Fallback'}
                    </span>
                    <span className="report-meta-tag">Real-Time</span>
                  </div>
                </div>

                {/* 1. Prominent Risk Verdict Banner */}
                <div className="verdict-banner">
                  <div className="verdict-icon-container">
                    {risk.icon}
                  </div>
                  <div className="verdict-info">
                    <div className="verdict-label-row">
                      <span className="verdict-prefix">Risk Level:</span>
                      <span className={`verdict-pill ${risk.badgeClass}`}>
                        {risk.label}
                      </span>
                    </div>
                    <p className="verdict-subtitle">{risk.subtitle}</p>
                  </div>
                  {/* Optional Risk Score Support */}
                  {typeof reportData.riskScore === 'number' && (
                    <div className="score-display">
                      <span className="score-value">{reportData.riskScore}</span>
                      <span className="score-label">/100 Risk</span>
                    </div>
                  )}
                </div>

                {/* 2. Visual Risk Meter */}
                <div className="risk-meter-container">
                  <div className="meter-label-row">
                    <span className="meter-title">Risk Severity Meter</span>
                    <span className="active-level-indicator" style={{ color: risk.color }}>
                      {risk.label}
                    </span>
                  </div>
                  <div className="meter-track">
                    <div className={`meter-segment segment-low ${reportData.riskLevel === 'LOW_RISK' ? 'active' : ''}`}>
                      <span>Low Risk</span>
                    </div>
                    <div className={`meter-segment segment-medium ${reportData.riskLevel === 'SUSPICIOUS' ? 'active' : ''}`}>
                      <span>Suspicious</span>
                    </div>
                    <div className={`meter-segment segment-high ${reportData.riskLevel === 'LIKELY_SCAM' ? 'active' : ''}`}>
                      <span>Likely Scam</span>
                    </div>
                  </div>
                  <div className="meter-pointer-wrapper">
                    <div className="meter-pointer" style={{ left: risk.meterPosition, borderColor: risk.color }}></div>
                  </div>
                </div>

                {/* 4. AI Analysis Section */}
                <div className="report-section ai-analysis-section">
                  <div className="section-heading">
                    <div className="section-icon-badge ai-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <h4>AI Analysis</h4>
                  </div>
                  <div className="ai-explanation-box">
                    <p className="ai-explanation-text">
                      {reportData.explanation || 'No detailed explanation provided for this assessment.'}
                    </p>
                  </div>
                </div>

                {/* 3. Detected Warning Signs Section */}
                <div className="report-section warning-signs-section">
                  <div className="section-heading">
                    <div className="section-icon-badge warning-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h4>
                      Detected Warning Signs
                      <span className="section-count">
                        ({reportData.reasons ? reportData.reasons.length : 0})
                      </span>
                    </h4>
                  </div>

                  {reportData.reasons && reportData.reasons.length > 0 ? (
                    <div className="reasons-grid">
                      {reportData.reasons.map((reason, index) => (
                        <div key={index} className="reason-card">
                          <span className="reason-indicator">!</span>
                          <span className="reason-text">{reason}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-signals">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>No critical scam or deception indicators identified.</span>
                    </div>
                  )}
                </div>

                {/* 5. Recommended Actions Section */}
                <div className="report-section actions-section">
                  <div className="section-heading">
                    <div className="section-icon-badge action-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <h4>Recommended Actions</h4>
                  </div>

                  {reportData.recommendations && reportData.recommendations.length > 0 ? (
                    <div className="recommendations-list">
                      {reportData.recommendations.map((rec, index) => (
                        <div key={index} className="recommendation-card">
                          <div className="action-step-num">{index + 1}</div>
                          <p className="action-text">{rec}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="recommendation-card">
                      <div className="action-step-num">1</div>
                      <p className="action-text">Proceed with standard digital caution when opening links.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} ScamShield SOC. AI Fraud & Phishing Detection Platform.</p>
      </footer>
    </div>
  );
}

export default App;
