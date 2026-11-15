# 🛡️ ScamShield

### **Before You Click, Check It.**

ScamShield is an **AI-powered scam detection web application** designed to help users identify potentially fraudulent messages and suspicious links before they take action.

Built for **Hackday 2.0**, ScamShield analyzes suspicious content and provides a clear risk assessment, explains the warning signs, and recommends safe next steps.

---

## 🤖 Powered by Google Gemini API

> **Google Gemini API is the core AI engine behind ScamShield.**

ScamShield uses the **Gemini API** as its **primary analysis engine** to understand suspicious messages and links in context.

Instead of simply matching a few keywords, Gemini helps analyze common scam indicators such as:

- 🚨 Urgency and fear tactics
- 🏦 Bank and brand impersonation
- 🔗 Suspicious or phishing links
- 🔐 Requests for OTPs, PINs, or passwords
- 🎁 Fake prizes and too-good-to-be-true offers
- 👤 Impersonation and social engineering attempts

The AI then provides a simple, easy-to-understand explanation so that even non-technical users can understand **why a message may be dangerous**.

---

## 🎯 The Problem

Online scams are becoming increasingly common. Fraudsters use fake KYC alerts, bank messages, job offers, refund links, and prize notifications to create panic and trick users into acting quickly.

Many everyday smartphone users don't have a quick and simple way to check whether a suspicious message is legitimate.

**ScamShield helps users pause, analyze, and make safer decisions before clicking.**

---

## ✨ Features

### 💬 AI-Powered Message Analysis
Paste a suspicious SMS, WhatsApp message, or other text and get an instant AI-powered risk assessment.

### 🔗 Suspicious Link Analysis
Check potentially dangerous links along with suspicious messages.

### 🛡️ Clear Risk Verdict
ScamShield categorizes content into:

- 🟢 **Low Risk**
- 🟡 **Suspicious**
- 🔴 **Likely Scam**

### 🔍 Explainable AI Results
Instead of only displaying a score, ScamShield explains the warning signs detected in simple language.

### ⚠️ Detected Warning Signs
The application identifies potential scam techniques such as urgency, impersonation, phishing attempts, and requests for sensitive information.

### 💡 Safety Recommendations
Users receive clear next steps, such as avoiding suspicious links and never sharing sensitive information.

### ⚡ Reliable Analysis Flow
Gemini API is used as the **primary analysis engine**, with graceful error handling to ensure a smooth user experience.

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### Artificial Intelligence
- **Google Gemini API** 🤖

### Development Tools
- Git
- GitHub

---

## 🏗️ Project Architecture

```text
User Input
    │
    ▼
React Frontend
    │
    ▼
Express Backend
    │
    ▼
🤖 Google Gemini API
    │
    ▼
Scam Analysis & Risk Assessment
    │
    ▼
Security Report for the User
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ScamShield
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure the Gemini API Key

Create a `.env` file inside the `server` folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit your `.env` file or API key to GitHub.

### 5. Start the Backend

Inside the `server` folder:

```bash
node index.js
```

### 6. Start the Frontend

Inside the `client` folder:

```bash
npm run dev
```

Open the local URL shown in your terminal to use ScamShield.

---

## 🔒 Privacy & Safety

ScamShield is designed to help users identify potential scam indicators. Users should avoid entering highly sensitive information such as:

- Passwords
- OTPs
- PINs
- Bank account credentials

The analysis is **AI-assisted** and should be used as an additional safety tool. For serious financial or cybersecurity concerns, users should verify information through official channels.

---

## 💡 How It Works

1. **Paste** a suspicious message or link.
2. **Analyze** the content using the Gemini-powered AI engine.
3. **Understand** the risk level and warning signs.
4. **Take action** using the recommended safety steps.

---

## 🎥 Example Use Case

**Input:**

> "URGENT! Your bank account will be blocked today because your KYC has expired. Click the link below immediately to update your details."

**ScamShield can identify potential warning signs such as:**

- Artificial urgency
- Possible bank impersonation
- Suspicious links
- Attempts to pressure the user into acting quickly

The user then receives a clear explanation and recommended safety actions.

---

## 🏆 Built For

**Hackday 2.0 — Hackathon Project**

---

### 🛡️ Think Before You Click.

**ScamShield — Helping users identify potential scams, one message at a time.**
