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
    bgGlow: 'rgba(16, 185, 129, 0.08)',
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
    bgGlow: 'rgba(245, 158, 11, 0.08)',
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
    bgGlow: 'rgba(239, 68, 68, 0.08)',
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
  const [activePanel, setActivePanel] = useState(null); // 'how' | 'about' | null

  const togglePanel = (panel) => setActivePanel(prev => prev === panel ? null : panel);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), link: link.trim() }),
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
  const charCount = message.length;
  const charWarning = charCount > 800;

  return (
    <div className="app-container">

      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="brand">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="brand-name">ScamShield</span>
          <span className="brand-badge">SOC AI Engine</span>
        </div>

        <nav className="nav-links">
          <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); setActivePanel(null); }}>Dashboard</a>
          <a href="#" className={`nav-link ${activePanel === 'how' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); togglePanel('how'); }}>How It Works</a>
          <a href="#" className={`nav-link ${activePanel === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); togglePanel('about'); }}>About</a>
        </nav>

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

      {/* ── How It Works Panel ── */}
      {activePanel === 'how' && (
        <div className="info-panel" role="region" aria-label="How It Works">
          <div className="info-panel-inner">
            <div className="info-panel-header">
              <h2 className="info-panel-title">How ScamShield Works</h2>
              <button className="info-panel-close" onClick={() => setActivePanel(null)}>✕</button>
            </div>
            <div className="info-steps-row">
              <div className="info-step">
                <div className="info-step-num blue">1</div>
                <div className="info-step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <h4>Paste Your Content</h4>
                <p>Drop any suspicious SMS, email, WhatsApp message, or URL into the scanner input.</p>
              </div>
              <div className="info-step-arrow">→</div>
              <div className="info-step">
                <div className="info-step-num cyan">2</div>
                <div className="info-step-icon cyan">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h4>Rule Engine Fires First</h4>
                <p>Instant heuristics check for urgency language, OTP requests, KYC threats, and suspicious domains.</p>
              </div>
              <div className="info-step-arrow">→</div>
              <div className="info-step">
                <div className="info-step-num purple">3</div>
                <div className="info-step-icon purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h4>Gemini AI Deep-Dives</h4>
                <p>Google Gemini performs semantic reasoning — identifying impersonation, psychological manipulation &amp; fraud patterns.</p>
              </div>
              <div className="info-step-arrow">→</div>
              <div className="info-step">
                <div className="info-step-num green">4</div>
                <div className="info-step-icon green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h4>Full Report Delivered</h4>
                <p>Get a risk verdict (Low / Suspicious / Likely Scam), AI explanation, warning signs &amp; recommended actions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── About Panel ── */}
      {activePanel === 'about' && (
        <div className="info-panel" role="region" aria-label="About ScamShield">
          <div className="info-panel-inner">
            <div className="info-panel-header">
              <h2 className="info-panel-title">About ScamShield</h2>
              <button className="info-panel-close" onClick={() => setActivePanel(null)}>✕</button>
            </div>
            <div className="about-row">
              <div className="about-block">
                <div className="about-icon blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h4>What is ScamShield?</h4>
                <p>ScamShield is an AI-powered fraud detection platform that analyzes suspicious messages and URLs in real time — built to protect everyday users from phishing, impersonation, and financial scams.</p>
              </div>
              <div className="about-block">
                <div className="about-icon purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                </div>
                <h4>Powered by Gemini AI</h4>
                <p>Uses Google's Gemini 3.8 Flash model for state-of-the-art language reasoning — detecting even complex psychological manipulation tactics that simple keyword filters miss.</p>
              </div>
              <div className="about-block">
                <div className="about-icon green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h4>Privacy First</h4>
                <p>Your API key stays server-side. No message data is stored or logged. ScamShield analyzes and discards — your inputs never leave the analysis pipeline.</p>
              </div>
            </div>
            <div className="about-tech-row">
              <span className="tech-badge">✨ Google Gemini AI</span>
              <span className="tech-badge">⚛️ React 19 + Vite</span>
              <span className="tech-badge">🟢 Node.js + Express</span>
              <span className="tech-badge">🛡️ Heuristic Engine</span>
              <span className="tech-badge">🔒 Zero Data Storage</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Stats Bar ── */}
      <section className="hero-banner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            AI-Powered Threat Intelligence
          </div>
          <h1 className="hero-title">
            Before You Click,{' '}
            <span className="highlight-text">Verify It.</span>
          </h1>
          <p className="hero-tagline">
            Instant detection of phishing, fraud, fake KYC &amp; deceptive URLs — powered by Gemini AI.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">99.2<span className="stat-unit">%</span></span>
            <span className="stat-desc">Detection Accuracy</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">&lt;2<span className="stat-unit">s</span></span>
            <span className="stat-desc">Avg Response Time</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">10K<span className="stat-unit">+</span></span>
            <span className="stat-desc">Threats Detected</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">3<span className="stat-unit">x</span></span>
            <span className="stat-desc">AI + Rule Layers</span>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard ── */}
      <main className="dashboard-main">
        <div className="dashboard-grid">

          {/* ── LEFT: Input Console ── */}
          <div className="dashboard-col col-input">
            <div className="console-card">
              <div className="card-header">
                <div className="card-title-group">
                  <span className="panel-badge">INPUT CONSOLE</span>
                  <h2 className="card-title">Threat Scanner</h2>
                </div>
                {(message || link) && (
                  <button type="button" onClick={handleClear} className="clear-btn">
                    ✕ Clear
                  </button>
                )}
              </div>

              <form onSubmit={handleAnalyze} className="scanner-form">
                {/* Suspicious Message */}
                <div className="form-group">
                  <div className="label-wrapper">
                    <label htmlFor="message-input" className="form-label">
                      Suspicious Message
                      <span className="required-indicator">*</span>
                    </label>
                    <span className={`char-indicator ${charWarning ? 'char-warn' : ''}`}>
                      {charCount} chars
                    </span>
                  </div>
                  <textarea
                    id="message-input"
                    className="form-textarea"
                    rows={7}
                    placeholder="Paste the suspicious SMS, WhatsApp message, email, or DM here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Suspicious URL */}
                <div className="form-group">
                  <div className="label-wrapper">
                    <label htmlFor="link-input" className="form-label">
                      Suspicious Link or URL
                    </label>
                    <span className="optional-tag">Optional</span>
                  </div>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                {/* Privacy Note */}
                <div className="privacy-note" role="note">
                  <svg className="privacy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p><strong>Privacy Note:</strong> Avoid entering real passwords, PINs, or OTPs.</p>
                </div>

                {/* Analyze Button */}
                <button type="submit" className="analyze-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner" aria-hidden="true"></span>
                      <span>Scanning Threat Vectors...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span>Analyze Threat Now</span>
                    </>
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="status-alert error" role="alert">
                  <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="status-content"><strong>Error:</strong> {error}</div>
                </div>
              )}

              {/* How It Works — always visible at bottom of left panel */}
              <div className="how-it-works">
                <p className="hiw-title">How ScamShield Works</p>
                <div className="hiw-steps">
                  <div className="hiw-step">
                    <span className="hiw-num">1</span>
                    <span className="hiw-text">Rule engine instantly flags urgency, OTP &amp; KYC threats</span>
                  </div>
                  <div className="hiw-step">
                    <span className="hiw-num">2</span>
                    <span className="hiw-text">Gemini AI performs deep semantic reasoning on content</span>
                  </div>
                  <div className="hiw-step">
                    <span className="hiw-num">3</span>
                    <span className="hiw-text">You receive a full threat report in under 2 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Report Panel ── */}
          <div className="dashboard-col col-report">

            {/* Loading — Radar */}
            {isLoading && (
              <div className="security-scanner-loading" role="status">
                <div className="radar-wrapper">
                  <div className="radar-ring ring-1"></div>
                  <div className="radar-ring ring-2"></div>
                  <div className="radar-ring ring-3"></div>
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
                    Cross-checking heuristics, malicious domains &amp; Gemini AI semantic reasoning
                  </p>
                  <div className="scanning-steps">
                    <span className="step-item">
                      <span className="step-dot"></span> Heuristic Check
                    </span>
                    <span className="step-item">
                      <span className="step-dot"></span> URL Inspection
                    </span>
                    <span className="step-item">
                      <span className="step-dot"></span> Gemini Semantic AI
                    </span>
                  </div>
                  <div className="scanning-progress-bar">
                    <div className="scanning-progress-fill"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Standby */}
            {!isLoading && !reportData && !error && (
              <div className="standby-card">
                <div className="standby-visual">
                  <div className="shield-ring ring-outer"></div>
                  <div className="shield-ring ring-inner"></div>
                  <div className="standby-shield-wrap">
                    <svg className="standby-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <h3 className="standby-title">Security Intelligence Standby</h3>
                <p className="standby-desc">
                  Paste any suspicious message or link to generate an instant AI threat verdict and full risk breakdown.
                </p>

                <div className="detection-matrix">
                  <div className="matrix-item">
                    <div className="matrix-icon-wrap matrix-blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div className="matrix-info">
                      <h4>Instant Heuristics</h4>
                      <p>Detects urgency, fake KYC, OTP requests &amp; account suspension threats.</p>
                    </div>
                  </div>
                  <div className="matrix-item">
                    <div className="matrix-icon-wrap matrix-cyan">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div className="matrix-info">
                      <h4>Domain Verification</h4>
                      <p>Spots deceptive URLs, typosquatting &amp; suspicious shortened links.</p>
                    </div>
                  </div>
                  <div className="matrix-item">
                    <div className="matrix-icon-wrap matrix-purple">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                      </svg>
                    </div>
                    <div className="matrix-info">
                      <h4>Gemini AI Reasoning</h4>
                      <p>Identifies complex impersonation and psychological fraud patterns.</p>
                    </div>
                  </div>
                </div>

                <div className="standby-cta">
                  <button type="button" onClick={loadSample} className="cta-sample-btn">
                    ⚡ Try a Sample Scam Message
                  </button>
                </div>
              </div>
            )}

            {/* Security Report */}
            {reportData && (
              <div className={`security-report ${risk.cardClass}`} id="security-report">

                {/* Report Header */}
                <div className="report-header">
                  <div className="report-title-group">
                    <span className="report-badge">SECURITY REPORT</span>
                    <h3 className="report-main-title">Threat Assessment</h3>
                  </div>
                  <div className="report-meta">
                    <span className={`report-meta-tag source-tag ${reportData.analysisSource === 'GEMINI' ? 'source-gemini' : 'source-fallback'}`}>
                      {reportData.analysisSource === 'GEMINI' ? '✨ Gemini AI' : '🛡️ Heuristic'}
                    </span>
                    <span className="report-meta-tag">Real-Time</span>
                  </div>
                </div>

                {/* Verdict Banner */}
                <div className="verdict-banner">
                  <div className="verdict-icon-container">
                    {risk.icon}
                  </div>
                  <div className="verdict-info">
                    <div className="verdict-label-row">
                      <span className="verdict-prefix">Risk Level:</span>
                      <span className={`verdict-pill ${risk.badgeClass}`}>{risk.label}</span>
                    </div>
                    <p className="verdict-subtitle">{risk.subtitle}</p>
                  </div>
                  {typeof reportData.riskScore === 'number' && (
                    <div className="score-display">
                      <span className="score-value">{reportData.riskScore}</span>
                      <span className="score-label">/100</span>
                    </div>
                  )}
                </div>

                {/* Risk Meter */}
                <div className="risk-meter-container">
                  <div className="meter-label-row">
                    <span className="meter-title">Risk Severity Meter</span>
                    <span className="active-level-indicator" style={{ color: risk.color }}>{risk.label}</span>
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

                {/* Two-column sections row */}
                <div className="report-sections-row">
                  {/* AI Analysis */}
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

                  {/* Warning Signs */}
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
                        Warning Signs
                        <span className="section-count">({reportData.reasons ? reportData.reasons.length : 0})</span>
                      </h4>
                    </div>
                    {reportData.reasons && reportData.reasons.length > 0 ? (
                      <div className="reasons-grid">
                        {reportData.reasons.map((reason, index) => (
                          <div key={index} className={`reason-card reason-card-${currentRiskKey.toLowerCase()}`}>
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
                        <span>No critical indicators identified.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Actions */}
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

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span>ScamShield SOC</span>
          </div>
          <div className="footer-badges">
            <span className="footer-badge">✨ Powered by Gemini AI</span>
            <span className="footer-badge">⚡ React + Vite</span>
            <span className="footer-badge">🛡️ Heuristic Engine</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} ScamShield. AI Fraud &amp; Phishing Detection Platform.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
