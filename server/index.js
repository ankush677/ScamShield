require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
const PORT = 5000;

// Enable CORS for requests from the React frontend running on port 5173
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Enable JSON body parsing
app.use(express.json());

// Root route (Health check)
app.get('/', (req, res) => {
  res.send('ScamShield backend is running!');
});

// JSON Schema for structured Gemini output
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      description: 'Overall risk level: strictly LOW_RISK, SUSPICIOUS, or LIKELY_SCAM.',
    },
    explanation: {
      type: Type.STRING,
      description: 'Concise 1-2 sentence plain-language explanation of why this content is safe or dangerous.',
    },
    reasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 4 specific scam signals found (e.g. artificial urgency, suspicious link, impersonation).',
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 3 clear safety action steps for the user.',
    },
  },
  required: ['riskLevel', 'explanation', 'reasons', 'recommendations'],
};

// Helper function to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Detect temporary 503, UNAVAILABLE, or high-demand server errors
function isTemporaryUnavailableError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode || (error.response && error.response.status);
  if (status === 503) return true;

  const msg = String(error.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand')
  );
}

// Emergency rule-based scam check (ONLY executed if Gemini is genuinely unavailable)
function runRuleBasedCheck(message = '', link = '') {
  const combinedText = `${message} ${link}`.toLowerCase();
  const detectedReasons = [];

  const rules = [
    {
      regex: /(urgent|immediately|within \d+\s*(hours?|mins?|minutes?)|immediate action|last warning|final notice|account suspended|deactivated|action required)/i,
      reason: 'Artificial urgency or pressure to force immediate action',
    },
    {
      regex: /(kyc|pan card|aadhaar|account (has been )?blocked|deactivation|electricity (bill|will be disconnected)|sim (card )?blocked|bank restriction)/i,
      reason: 'Threat of account suspension or fake KYC/service deactivation',
    },
    {
      regex: /(otp|one.time.password|pin|password|cvv|card number|debit card|netbanking credentials)/i,
      reason: 'Direct request for confidential credentials (OTP, PIN, or password)',
    },
    {
      regex: /(congratulations|you (have )?won|lottery|lucky draw|cash prize|free gift|claimed (reward|prize)|earn \d+ daily|guaranteed return)/i,
      reason: 'Unrealistic prize, lottery claim, or high-yield financial promise',
    },
    {
      regex: /(https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|\.xyz\/|\.top\/|\.click\/|paypa1|amaz0n|sb1|hdfcc)/i,
      reason: 'Suspicious, shortened, or deceptive web link detected',
    },
  ];

  for (const rule of rules) {
    if (rule.regex.test(combinedText)) {
      detectedReasons.push(rule.reason);
    }
  }

  let riskLevel = 'LOW_RISK';
  let explanation = 'No common scam or phishing indicators were detected in this content.';

  if (detectedReasons.length >= 2 || /(otp|pin|password|cvv)/i.test(combinedText)) {
    riskLevel = 'LIKELY_SCAM';
    explanation = 'This content exhibits strong signals commonly associated with phishing attacks or financial fraud.';
  } else if (detectedReasons.length === 1) {
    riskLevel = 'SUSPICIOUS';
    explanation = 'This content contains warning signs often seen in deceptive messages. Proceed with caution.';
  }

  let recommendations = [];
  if (riskLevel === 'LIKELY_SCAM') {
    recommendations = [
      'Do not click any links or download attached files.',
      'Never share OTPs, passwords, or personal banking credentials.',
      'Block the sender and verify with the official institution directly.',
    ];
  } else if (riskLevel === 'SUSPICIOUS') {
    recommendations = [
      'Verify the sender through an official website or phone number.',
      'Avoid entering credentials or personal info on unfamiliar pages.',
      'Do not forward this message to others.',
    ];
  } else {
    recommendations = [
      'Always double-check sender details before clicking external links.',
      'Keep your device security software up to date.',
    ];
  }

  return {
    riskLevel,
    explanation,
    reasons: detectedReasons.slice(0, 4),
    recommendations: recommendations.slice(0, 3),
  };
}

// Call Gemini with only ONE retry on temporary 503 errors
async function callGeminiWithSingleRetry(ai, prompt) {
  const model = 'gemini-3.8-flash';
  const requestPayload = {
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      maxOutputTokens: 500,
      temperature: 0.2,
    },
  };

  try {
    return await ai.models.generateContent(requestPayload);
  } catch (error) {
    // If temporary 503 error, retry only once after a short delay
    if (isTemporaryUnavailableError(error)) {
      console.warn('[Gemini API] Temporary 503/UNAVAILABLE encountered. Retrying once in 1200ms...');
      await sleep(1200);
      return await ai.models.generateContent(requestPayload);
    }
    throw error;
  }
}

// POST /api/analyze - Primary Gemini Analysis with Emergency Rule-Based Fallback
app.post('/api/analyze', async (req, res) => {
  try {
    const { message, link } = req.body || {};

    // Validate input: at least a message or link must be provided
    if ((!message || !message.trim()) && (!link || !link.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message or a link to analyze.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please add your GEMINI_API_KEY to server/.env.',
      });
    }

    let finalAnalysis;
    let analysisSource = 'GEMINI';

    // Step 1: PRIMARY ENGINE - Call Gemini API First
    try {
      console.log('[ScamShield] PRIMARY SCAN: Calling Gemini API (gemini-3.8-flash)...');

      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { timeout: 25000 }, // 25-second timeout gives Gemini ample time to respond
      });

      const prompt = `You are ScamShield AI, an advanced scam and phishing detection assistant.
Analyze this message and link for potential scam, phishing, or fraud indicators:

Message: "${message && message.trim() ? message.trim() : 'None provided'}"
Link: "${link && link.trim() ? link.trim() : 'None provided'}"

Evaluate for: urgency/panic tactics, impersonation, phishing domains, credential theft (OTP/PIN/passwords), and fake prizes.

Rules:
- riskLevel: strictly LOW_RISK, SUSPICIOUS, or LIKELY_SCAM.
- explanation: maximum 2 concise sentences in plain language.
- reasons: array of up to 4 specific scam indicators detected.
- recommendations: array of up to 3 actionable safety precautions for the user.`;

      const response = await callGeminiWithSingleRetry(ai, prompt);
      const rawText = typeof response.text === 'function' ? response.text() : response.text;

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Validate Gemini's response fields strictly
      const validLevels = ['LOW_RISK', 'SUSPICIOUS', 'LIKELY_SCAM'];
      const riskLevel = validLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'SUSPICIOUS';
      const explanation = parsed.explanation || 'Content analyzed by ScamShield AI.';
      const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 4) : [];
      const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [];

      finalAnalysis = {
        riskLevel,
        explanation,
        reasons,
        recommendations,
      };
      analysisSource = 'GEMINI';

      console.log('[ScamShield] SUCCESS: Analysis completed by GEMINI API.');
    } catch (geminiError) {
      // Step 2: EMERGENCY FALLBACK - Only invoked if Gemini genuinely fails after retry
      console.warn(
        `[ScamShield] WARNING: Gemini API unavailable (${geminiError.status || geminiError.message}). Activating emergency rule-based fallback...`
      );

      finalAnalysis = runRuleBasedCheck(message, link);
      analysisSource = 'FALLBACK';

      console.log('[ScamShield] FALLBACK: Analysis served via Emergency Rule Engine.');
    }

    // Step 3: Return consistent API response with analysisSource
    return res.json({
      success: true,
      message:
        analysisSource === 'GEMINI'
          ? 'Analysis completed via Gemini AI'
          : 'Analysis completed via Emergency Fallback',
      data: {
        riskLevel: finalAnalysis.riskLevel,
        explanation: finalAnalysis.explanation,
        reasons: finalAnalysis.reasons,
        recommendations: finalAnalysis.recommendations,
        analysisSource, // 'GEMINI' or 'FALLBACK'
        receivedMessage: message || null,
        receivedLink: link || null,
        status: finalAnalysis.riskLevel,
      },
    });
  } catch (error) {
    console.error('[ScamShield] Unexpected server error in /api/analyze:', error.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while analyzing the content.',
    });
  }
});

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred on the server.',
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
