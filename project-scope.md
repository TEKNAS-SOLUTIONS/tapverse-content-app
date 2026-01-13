# Tapverse Content Automation System - Complete Technical Specification

**Project:** Internal content automation system for Tapverse
**Target:** 10 internal clients (no extra charge)
**Goal:** Automate SEO content + social content + ads + AI avatar videos
**Timeline:** Phase-wise sequential development
**Tech Stack:** React (Frontend) + Node.js/Python (Backend) + PostgreSQL + Claude API + HeyGen API + ElevenLabs API

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [API Integrations](#4-api-integrations)
5. [Phase 1: Core MVP](#5-phase-1-core-mvp)
6. [Phase 2: AI Avatar Video Reels](#6-phase-2-ai-avatar-video-reels)
7. [Phase 3: Social Expansion](#7-phase-3-social-expansion)
8. [Phase 4: Advanced Features](#8-phase-4-advanced-features)
9. [Frontend Specifications](#9-frontend-specifications)
10. [Backend Specifications](#10-backend-specifications)
11. [Claude Prompts](#11-claude-prompts)
12. [Implementation Guide](#12-implementation-guide)
13. [Cost Analysis](#13-cost-analysis)
14. [Deployment Strategy](#14-deployment-strategy)

---

# 1. PROJECT OVERVIEW

## 1.1 System Purpose

The Tapverse Content Automation System is an internal tool that automates content creation across multiple channels for Tapverse's clients:

**Input:** Client information (website, keywords, competitors, unique angle)

**Processing:** 
- Claude AI analyzes and generates content
- System optimizes for multiple platforms
- AI avatars create video content

**Output:** 
- SEO-optimized blog posts
- Social media content (LinkedIn, Twitter, Instagram, TikTok)
- Email newsletters
- Google Ads copy and strategy
- Facebook Ads copy and strategy
- AI avatar video reels

## 1.2 Target Users

- **Internal Users:** Tapverse team members managing client projects
- **Clients:** 10 existing Tapverse clients (no extra charge)
- **Future:** Scalable to unlimited clients

## 1.3 Key Success Metrics

- Phase 1 launch in 4-6 weeks
- 100% uptime for 10 clients
- Content generation time: < 5 minutes per client
- API cost per client: < $50/month
- Client satisfaction: > 4.5/5 stars

## 1.4 Constraints & Assumptions

- **No extra charge:** System is bundled with existing Tapverse services
- **API-only approach:** No proprietary AI model building
- **Sequential development:** Phases built one after another
- **Cursor-driven:** Entire system built using Cursor
- **Scalable architecture:** Design supports future growth beyond 10 clients

---

# 2. SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Client Dashboard                                         │
│  - Content Input Form                                       │
│  - Content Preview & Management                             │
│  - Analytics Dashboard                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway (Node.js)                       │
│  - Authentication & Authorization                           │
│  - Rate Limiting                                            │
│  - Request Validation                                       │
│  - Error Handling                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend Services (Node.js/Python)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Content Generation Service                          │  │
│  │ - Claude API integration                            │  │
│  │ - Content generation logic                          │  │
│  │ - Optimization engine                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Video Generation Service                            │  │
│  │ - HeyGen API integration                            │  │
│  │ - ElevenLabs API integration                        │  │
│  │ - Video orchestration                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Ads Generation Service                              │  │
│  │ - Google Ads copy generation                        │  │
│  │ - Facebook Ads copy generation                      │  │
│  │ - Campaign strategy                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Social Content Service                              │  │
│  │ - Platform-specific optimization                    │  │
│  │ - Content scheduling                                │  │
│  │ - Platform APIs integration                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Analytics Service                                   │  │
│  │ - Performance tracking                              │  │
│  │ - Reporting                                         │  │
│  │ - Optimization recommendations                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External APIs                              │
│  - Claude API (content generation)                          │
│  - HeyGen API (video creation)                             │
│  - ElevenLabs API (voiceover)                              │
│  - Google Ads API (ads management)                         │
│  - Facebook Marketing API (ads management)                 │
│  - LinkedIn API (social posting)                           │
│  - Twitter API (social posting)                            │
│  - Instagram API (social posting)                          │
│  - TikTok API (social posting)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                      │
│  - Clients                                                  │
│  - Projects                                                 │
│  - Content                                                  │
│  - Videos                                                   │
│  - Ads                                                      │
│  - Analytics                                                │
│  - API Usage Tracking                                       │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Technology Stack

**Frontend:**
- **Framework:** React 18+
- **Styling:** TailwindCSS
- **State Management:** Redux or Zustand
- **HTTP Client:** Axios
- **Build Tool:** Vite

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript/TypeScript
- **Job Queue:** Bull (Redis-based)
- **Authentication:** JWT + OAuth2

**Database:**
- **Primary:** PostgreSQL 14+
- **Caching:** Redis
- **File Storage:** AWS S3 or local storage

**External Services:**
- Claude API (OpenAI-compatible)
- HeyGen API
- ElevenLabs API
- Google Ads API
- Facebook Marketing API
- LinkedIn API
- Twitter API
- Instagram API
- TikTok API

## 2.3 Data Flow

### Content Generation Flow

```
User Input (Client Info)
    ↓
Validate Input
    ↓
Store in Database
    ↓
Trigger Content Generation Job
    ↓
Claude API - Analyze Competitors
    ↓
Claude API - Generate Blog Content
    ↓
Claude API - Generate Social Content
    ↓
Claude API - Generate Ads Copy
    ↓
Optimize Content
    ↓
Store Content in Database
    ↓
Notify User (Content Ready)
    ↓
User Reviews & Downloads
```

### Video Generation Flow

```
Blog Content
    ↓
Extract Key Points
    ↓
Claude API - Generate Video Script
    ↓
HeyGen API - Create Avatar Video
    ↓
ElevenLabs API - Generate Voiceover
    ↓
Sync Audio + Video
    ↓
Store Video in S3
    ↓
Notify User (Video Ready)
```

---

# 3. DATABASE SCHEMA

## 3.1 Core Tables

### 3.1.1 Clients Table

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  tapverse_client_id VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(255),
  industry VARCHAR(100),
  target_audience TEXT,
  unique_selling_points TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

### 3.1.2 Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(50), -- 'seo', 'social', 'ads', 'video'
  keywords TEXT[], -- Array of keywords
  competitors TEXT[], -- Array of competitor URLs
  target_audience TEXT,
  unique_angle TEXT,
  status VARCHAR(50), -- 'draft', 'processing', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.1.3 Content Table

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  content_type VARCHAR(50), -- 'blog', 'linkedin', 'twitter', 'instagram', 'email', 'google_ads', 'facebook_ads'
  title VARCHAR(255),
  content TEXT,
  meta_description VARCHAR(160),
  keywords TEXT[],
  platform VARCHAR(50),
  status VARCHAR(50), -- 'draft', 'ready', 'published'
  seo_score INT,
  engagement_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.1.4 Videos Table

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  content_id UUID REFERENCES content(id),
  video_type VARCHAR(50), -- 'avatar', 'animated', 'slideshow'
  script TEXT,
  avatar_id VARCHAR(255),
  voiceover_url VARCHAR(500),
  video_url VARCHAR(500),
  duration_seconds INT,
  status VARCHAR(50), -- 'processing', 'ready', 'published'
  heyGen_job_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.1.5 Ads Table

```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  ad_type VARCHAR(50), -- 'google_search', 'google_display', 'facebook', 'instagram'
  platform VARCHAR(50),
  headline VARCHAR(255),
  body_text TEXT,
  cta_text VARCHAR(100),
  target_keywords TEXT[],
  estimated_cpc DECIMAL(10, 2),
  estimated_ctr DECIMAL(5, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.1.6 API Usage Tracking Table

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  api_name VARCHAR(100), -- 'claude', 'heyGen', 'elevenLabs', etc.
  request_count INT,
  tokens_used INT,
  cost DECIMAL(10, 4),
  month DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.1.7 Analytics Table

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content(id),
  video_id UUID REFERENCES videos(id),
  ad_id UUID REFERENCES ads(id),
  metric_type VARCHAR(50), -- 'views', 'clicks', 'impressions', 'conversions'
  metric_value INT,
  metric_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3.2 Indexes for Performance

```sql
CREATE INDEX idx_clients_tapverse_id ON clients(tapverse_client_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_content_project_id ON content(project_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_videos_project_id ON videos(project_id);
CREATE INDEX idx_ads_project_id ON ads(project_id);
CREATE INDEX idx_api_usage_client_month ON api_usage(client_id, month);
CREATE INDEX idx_analytics_content_id ON analytics(content_id);
```

---

# 4. API INTEGRATIONS

## 4.1 Claude API Integration

**Purpose:** Content generation for all content types

**Endpoint:** OpenAI-compatible API (pre-configured)

**Key Operations:**
1. Competitor analysis
2. Blog content generation
3. Social media content generation
4. Ads copy generation
5. Video script generation

**Implementation:**

```javascript
// Backend - Claude API Integration
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateContent(prompt) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].text;
}

module.exports = { generateContent };
```

**Cost:** ~$0.003-0.03 per 1K tokens (input/output)

**Rate Limits:** 
- Requests per minute: 50 (can be increased)
- Tokens per minute: 40,000

## 4.2 HeyGen API Integration

**Purpose:** AI avatar video creation

**Endpoint:** https://api.heygen.com/v1

**Key Operations:**
1. Create avatar video from script
2. Select avatar
3. Generate video
4. Download video

**Implementation:**

```javascript
// Backend - HeyGen API Integration
const axios = require("axios");

const heyGenClient = axios.create({
  baseURL: "https://api.heygen.com/v1",
  headers: {
    "X-API-Key": process.env.HEYGEN_API_KEY,
  },
});

async function createAvatarVideo(script, avatarId = "default") {
  try {
    // Create video task
    const response = await heyGenClient.post("/video.generate", {
      test: false,
      caption: true,
      dimension: {
        width: 1080,
        height: 1920,
      },
      duration: 30,
      persona: {
        name: avatarId,
      },
      script: {
        type: "text",
        input: script,
      },
    });

    return response.data.data.video_id;
  } catch (error) {
    console.error("HeyGen API error:", error);
    throw error;
  }
}

async function getVideoStatus(videoId) {
  const response = await heyGenClient.get(`/video_status.get?video_id=${videoId}`);
  return response.data.data;
}

module.exports = { createAvatarVideo, getVideoStatus };
```

**Cost:** ~$0.10-0.50 per video minute (depending on avatar and quality)

**Avatars Available:**
- Multiple pre-built avatars
- Custom avatar creation (premium)

## 4.3 ElevenLabs API Integration

**Purpose:** Voiceover generation for videos

**Endpoint:** https://api.elevenlabs.io/v1

**Key Operations:**
1. Generate voiceover from text
2. Select voice
3. Download audio

**Implementation:**

```javascript
// Backend - ElevenLabs API Integration
const axios = require("axios");

const elevenLabsClient = axios.create({
  baseURL: "https://api.elevenlabs.io/v1",
  headers: {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
  },
});

async function generateVoiceover(text, voiceId = "default") {
  try {
    const response = await elevenLabsClient.post(
      `/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        responseType: "arraybuffer",
      }
    );

    return response.data; // Audio buffer
  } catch (error) {
    console.error("ElevenLabs API error:", error);
    throw error;
  }
}

module.exports = { generateVoiceover };
```

**Cost:** ~$0.003-0.03 per 1K characters

**Voices Available:** 100+ pre-built voices

## 4.4 Google Ads API Integration

**Purpose:** Google Ads campaign management

**Endpoint:** https://googleads.googleapis.com/v15

**Key Operations:**
1. Create search campaigns
2. Create display campaigns
3. Manage keywords
4. Track performance

**Implementation:**

```javascript
// Backend - Google Ads API Integration
const { GoogleAdsApi } = require("google-ads-api");

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

async function createSearchCampaign(customerId, campaignData) {
  try {
    const customer = client.Customer({
      customer_id: customerId,
      login_customer_id: customerId,
    });

    // Campaign creation logic
    // This is simplified - actual implementation is more complex
  } catch (error) {
    console.error("Google Ads API error:", error);
    throw error;
  }
}

module.exports = { createSearchCampaign };
```

**Cost:** No API cost (charged per ads spend)

## 4.5 Facebook Marketing API Integration

**Purpose:** Facebook/Instagram ads management

**Endpoint:** https://graph.instagram.com/v18.0

**Key Operations:**
1. Create ad campaigns
2. Manage ad sets
3. Create ads
4. Track performance

**Implementation:**

```javascript
// Backend - Facebook Marketing API Integration
const axios = require("axios");

const fbClient = axios.create({
  baseURL: "https://graph.instagram.com/v18.0",
});

async function createFacebookAd(adAccountId, adData) {
  try {
    const response = await fbClient.post(
      `/${adAccountId}/adcreatives`,
      {
        name: adData.name,
        object_story_spec: {
          page_id: adData.pageId,
          link_data: {
            message: adData.message,
            link: adData.link,
            caption: adData.caption,
            description: adData.description,
            image_hash: adData.imageHash,
          },
        },
      },
      {
        params: {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Facebook Marketing API error:", error);
    throw error;
  }
}

module.exports = { createFacebookAd };
```

**Cost:** No API cost (charged per ads spend)

## 4.6 Social Media APIs

### LinkedIn API

```javascript
// LinkedIn content posting
async function postToLinkedIn(content, accessToken) {
  // Implementation for LinkedIn posting
}
```

### Twitter API

```javascript
// Twitter content posting
async function postToTwitter(content, accessToken) {
  // Implementation for Twitter posting
}
```

### Instagram API

```javascript
// Instagram content posting
async function postToInstagram(content, accessToken) {
  // Implementation for Instagram posting
}
```

### TikTok API

```javascript
// TikTok content posting
async function postToTikTok(content, accessToken) {
  // Implementation for TikTok posting
}
```

---

# 5. PHASE 1: CORE MVP

## 5.1 Phase 1 Scope

**Deliverables:**
1. Blog content generation (SEO + AI Overviews + AI search optimized)
2. LinkedIn posts generation
3. Google Ads copy + strategy
4. Facebook Ads copy + strategy

**Not included in Phase 1:**
- TikTok content
- Instagram content
- Email newsletters
- AI avatar videos
- Video content
- Analytics dashboard
- Scheduling

## 5.2 Phase 1 Features

### 5.2.1 Client Input Form

**Frontend Component:**

```jsx
// Components/ClientInputForm.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ClientInputForm() {
  const [formData, setFormData] = useState({
    clientName: "",
    website: "",
    keywords: "",
    competitors: "",
    targetAudience: "",
    uniqueAngle: "",
    contentPreferences: "professional",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/projects/create", {
        ...formData,
        keywords: formData.keywords.split(",").map((k) => k.trim()),
        competitors: formData.competitors.split(",").map((c) => c.trim()),
      });

      // Redirect to content preview
      window.location.href = `/projects/${response.data.projectId}`;
    } catch (err) {
      setError(err.response?.data?.message || "Error creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Website URL</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Target Keywords (comma-separated)
        </label>
        <textarea
          name="keywords"
          value={formData.keywords}
          onChange={handleChange}
          required
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Competitor URLs (comma-separated)
        </label>
        <textarea
          name="competitors"
          value={formData.competitors}
          onChange={handleChange}
          required
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Target Audience</label>
        <textarea
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          required
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Unique Angle</label>
        <textarea
          name="uniqueAngle"
          value={formData.uniqueAngle}
          onChange={handleChange}
          required
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Content Preferences</label>
        <select
          name="contentPreferences"
          value={formData.contentPreferences}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
          <option value="creative">Creative</option>
        </select>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Generating Content..." : "Generate Content"}
      </button>
    </form>
  );
}
```

### 5.2.2 Backend Content Generation Endpoint

**Backend Implementation:**

```javascript
// routes/projects.js
const express = require("express");
const router = express.Router();
const { generateContent } = require("../services/claude");
const { createProject, saveContent } = require("../db/queries");
const Bull = require("bull");

// Create job queue for content generation
const contentQueue = new Bull("content-generation", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// POST /api/projects/create
router.post("/create", async (req, res) => {
  try {
    const {
      clientName,
      website,
      keywords,
      competitors,
      targetAudience,
      uniqueAngle,
      contentPreferences,
    } = req.body;

    // Create project in database
    const project = await createProject({
      clientName,
      website,
      keywords,
      competitors,
      targetAudience,
      uniqueAngle,
      contentPreferences,
      status: "processing",
    });

    // Queue content generation job
    await contentQueue.add(
      {
        projectId: project.id,
        clientName,
        website,
        keywords,
        competitors,
        targetAudience,
        uniqueAngle,
        contentPreferences,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    res.json({
      success: true,
      projectId: project.id,
      message: "Content generation started",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message });
  }
});

// Process content generation job
contentQueue.process(async (job) => {
  const {
    projectId,
    clientName,
    website,
    keywords,
    competitors,
    targetAudience,
    uniqueAngle,
    contentPreferences,
  } = job.data;

  try {
    // Step 1: Analyze competitors
    const competitorAnalysis = await generateContent(
      `Analyze these competitor URLs for the keyword "${keywords[0]}":
      ${competitors.join("\n")}
      
      Provide:
      1. Their strengths
      2. Their weaknesses
      3. Content gaps
      4. Unique angle we can take`
    );

    // Step 2: Generate blog content
    const blogContent = await generateContent(
      `Create an SEO-optimized blog post for the keyword "${keywords[0]}"
      
      Target audience: ${targetAudience}
      Unique angle: ${uniqueAngle}
      Competitor weaknesses: ${competitorAnalysis}
      
      Requirements:
      - 3,500-4,500 words
      - Optimized for Google SEO
      - Optimized for Google AI Overviews
      - Optimized for ChatGPT Search
      - Optimized for Perplexity
      - Optimized for Claude Search
      - Optimized for Copilot
      
      Include:
      - SEO title (under 60 characters)
      - Meta description (under 160 characters)
      - H2 and H3 headers
      - Bullet points
      - Real examples
      - Clear structure`
    );

    // Step 3: Generate LinkedIn post
    const linkedinContent = await generateContent(
      `Create a professional LinkedIn post based on this blog topic: "${keywords[0]}"
      
      Requirements:
      - 150-300 words
      - Engaging and professional
      - Include 3-5 key takeaways
      - Add call-to-action
      - Include relevant hashtags
      - Target audience: ${targetAudience}`
    );

    // Step 4: Generate Google Ads copy
    const googleAdsContent = await generateContent(
      `Create Google Search Ads copy for the keyword "${keywords[0]}"
      
      Requirements:
      - Headline 1 (30 characters max)
      - Headline 2 (30 characters max)
      - Headline 3 (30 characters max)
      - Description 1 (90 characters max)
      - Description 2 (90 characters max)
      - Include unique angle: ${uniqueAngle}
      - Include call-to-action`
    );

    // Step 5: Generate Facebook Ads copy
    const facebookAdsContent = await generateContent(
      `Create Facebook Ads copy for the keyword "${keywords[0]}"
      
      Requirements:
      - Primary text (125 characters max)
      - Headline (27 characters max)
      - Description (30 characters max)
      - Call-to-action button text
      - Target audience: ${targetAudience}
      - Include unique angle: ${uniqueAngle}`
    );

    // Save all content to database
    await saveContent(projectId, {
      blog: blogContent,
      linkedin: linkedinContent,
      googleAds: googleAdsContent,
      facebookAds: facebookAdsContent,
    });

    // Update project status
    await updateProjectStatus(projectId, "completed");

    return {
      success: true,
      projectId,
      contentTypes: ["blog", "linkedin", "googleAds", "facebookAds"],
    };
  } catch (error) {
    console.error("Error in content generation job:", error);
    throw error;
  }
});

module.exports = router;
```

### 5.2.3 Content Preview Component

**Frontend:**

```jsx
// Components/ContentPreview.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ContentPreview({ projectId }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("blog");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [projectId]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/content`);
      setContent(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load content");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading content...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!content) return <div className="p-6">No content available</div>;

  const tabs = [
    { id: "blog", label: "Blog Post" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "googleAds", label: "Google Ads" },
    { id: "facebookAds", label: "Facebook Ads" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Generated Content</h1>

      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="prose max-w-none">
          {activeTab === "blog" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{content.blog.title}</h2>
              <p className="text-gray-600 mb-4">{content.blog.metaDescription}</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: content.blog.content,
                }}
              />
            </div>
          )}

          {activeTab === "linkedin" && (
            <div>
              <p className="text-lg mb-4">{content.linkedin.content}</p>
              <div className="text-sm text-gray-600">
                {content.linkedin.hashtags.map((tag) => (
                  <span key={tag} className="mr-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "googleAds" && (
            <div>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-bold text-blue-600 mb-2">
                  {content.googleAds.headline1}
                </h3>
                <p className="text-sm text-gray-600">
                  {content.googleAds.description1}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                {content.googleAds.cta}
              </button>
            </div>
          )}

          {activeTab === "facebookAds" && (
            <div>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-bold mb-2">{content.facebookAds.headline}</h3>
                <p className="text-sm mb-2">{content.facebookAds.primaryText}</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">
                  {content.facebookAds.cta}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Download All
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Publish Content
        </button>
        <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Edit & Regenerate
        </button>
      </div>
    </div>
  );
}
```

## 5.3 Phase 1 Implementation Checklist

- [ ] Database schema created
- [ ] Client input form built
- [ ] Claude API integration complete
- [ ] Content generation service implemented
- [ ] Job queue setup (Bull/Redis)
- [ ] Content preview component built
- [ ] Download functionality implemented
- [ ] Error handling and logging
- [ ] Testing with 2-3 clients
- [ ] Documentation complete
- [ ] Deployment to staging
- [ ] Phase 1 launch to 10 clients

---

# 6. PHASE 2: AI AVATAR VIDEO REELS

## 6.1 Phase 2 Scope

**Deliverables:**
1. AI avatar video generation from blog content
2. Voiceover integration
3. Video preview and management
4. Multiple avatar options

**Duration:** 2-3 weeks after Phase 1

## 6.2 Video Generation Flow

```
Blog Content
    ↓
Extract Key Points (Claude)
    ↓
Generate Video Script (Claude)
    ↓
Select Avatar
    ↓
HeyGen API - Create Video
    ↓
ElevenLabs API - Generate Voiceover
    ↓
Sync Audio + Video
    ↓
Store in S3
    ↓
Preview & Download
```

## 6.3 Backend Implementation

### 6.3.1 Video Generation Service

```javascript
// services/videoGeneration.js
const { generateContent } = require("./claude");
const { createAvatarVideo, getVideoStatus } = require("./heyGen");
const { generateVoiceover } = require("./elevenLabs");
const Bull = require("bull");
const fs = require("fs");
const path = require("path");

const videoQueue = new Bull("video-generation", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

async function generateVideoFromBlog(projectId, blogContent, avatarId = "default") {
  try {
    // Step 1: Extract key points from blog
    const keyPoints = await generateContent(
      `Extract 5-7 key points from this blog content for a 30-second video:
      
      ${blogContent}
      
      Format as bullet points, each 1-2 sentences max.`
    );

    // Step 2: Generate video script
    const videoScript = await generateContent(
      `Create a 30-second video script based on these key points:
      
      ${keyPoints}
      
      Requirements:
      - Natural, conversational tone
      - 80-100 words
      - Include call-to-action at the end
      - Engaging opening
      - Clear message`
    );

    // Step 3: Generate voiceover
    const voiceoverBuffer = await generateVoiceover(videoScript);

    // Step 4: Create avatar video
    const videoJobId = await createAvatarVideo(videoScript, avatarId);

    // Step 5: Poll for video completion
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const status = await getVideoStatus(videoJobId);

      if (status.status === "completed") {
        videoUrl = status.video_url;
      } else if (status.status === "failed") {
        throw new Error(`Video generation failed: ${status.error}`);
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("Video generation timeout");
    }

    // Step 6: Save video info to database
    const videoData = {
      projectId,
      script: videoScript,
      avatarId,
      videoUrl,
      voiceoverUrl: null, // HeyGen includes voiceover
      duration: 30,
      status: "ready",
      heyGenJobId: videoJobId,
    };

    return videoData;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

// Queue processor
videoQueue.process(async (job) => {
  const { projectId, blogContent, avatarId } = job.data;

  try {
    const videoData = await generateVideoFromBlog(projectId, blogContent, avatarId);

    // Save to database
    await saveVideo(videoData);

    return {
      success: true,
      videoId: videoData.id,
      videoUrl: videoData.videoUrl,
    };
  } catch (error) {
    console.error("Video generation job failed:", error);
    throw error;
  }
});

module.exports = {
  generateVideoFromBlog,
  videoQueue,
};
```

### 6.3.2 Video API Endpoints

```javascript
// routes/videos.js
const express = require("express");
const router = express.Router();
const { videoQueue } = require("../services/videoGeneration");
const { getProjectContent, saveVideo, getVideos } = require("../db/queries");

// POST /api/videos/generate
router.post("/generate", async (req, res) => {
  try {
    const { projectId, contentId, avatarId = "default" } = req.body;

    // Get blog content
    const content = await getProjectContent(contentId);

    if (!content || content.content_type !== "blog") {
      return res.status(400).json({ error: "Invalid blog content" });
    }

    // Queue video generation
    const job = await videoQueue.add(
      {
        projectId,
        blogContent: content.content,
        avatarId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    res.json({
      success: true,
      jobId: job.id,
      message: "Video generation started",
    });
  } catch (error) {
    console.error("Error queuing video:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/videos/:projectId
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const videos = await getVideos(projectId);

    res.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/videos/job/:jobId
router.get("/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await videoQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const progress = job._progress;

    res.json({
      success: true,
      state,
      progress,
      data: job.data,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 6.3.3 Frontend Video Component

```jsx
// Components/VideoGenerator.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function VideoGenerator({ projectId, contentId }) {
  const [avatarId, setAvatarId] = useState("avatar_1");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const avatarOptions = [
    { id: "avatar_1", name: "Sarah - Professional" },
    { id: "avatar_2", name: "John - Casual" },
    { id: "avatar_3", name: "Emma - Energetic" },
    { id: "avatar_4", name: "Michael - Executive" },
  ];

  useEffect(() => {
    fetchVideos();
  }, [projectId]);

  useEffect(() => {
    if (jobId) {
      const interval = setInterval(() => {
        checkJobStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [jobId]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`/api/videos/${projectId}`);
      setVideos(response.data.videos);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/videos/generate", {
        projectId,
        contentId,
        avatarId,
      });

      setJobId(response.data.jobId);
    } catch (err) {
      setError(err.response?.data?.error || "Error generating video");
      setLoading(false);
    }
  };

  const checkJobStatus = async () => {
    try {
      const response = await axios.get(`/api/videos/job/${jobId}`);
      setJobStatus(response.data);

      if (response.data.state === "completed") {
        fetchVideos();
        setJobId(null);
        setLoading(false);
      } else if (response.data.state === "failed") {
        setError("Video generation failed");
        setJobId(null);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking job status:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Generate AI Avatar Video</h2>

      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Avatar</label>
          <select
            value={avatarId}
            onChange={(e) => setAvatarId(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {avatarOptions.map((avatar) => (
              <option key={avatar.id} value={avatar.id}>
                {avatar.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {loading && jobStatus && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">
              Status: {jobStatus.state}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${jobStatus.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateVideo}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating Video..." : "Generate Video"}
        </button>
      </div>

      {videos.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Generated Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <video
                  src={video.video_url}
                  controls
                  className="w-full rounded-lg mb-4"
                />
                <p className="text-sm text-gray-600 mb-2">
                  Avatar: {video.avatar_id}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Duration: {video.duration_seconds}s
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Download
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 6.4 Phase 2 Implementation Checklist

- [ ] Video generation service implemented
- [ ] HeyGen API integration complete
- [ ] ElevenLabs API integration complete
- [ ] Video API endpoints created
- [ ] Frontend video generator component built
- [ ] Job queue and status tracking
- [ ] Video preview component
- [ ] Download functionality
- [ ] Error handling and retry logic
- [ ] Testing with 2-3 clients
- [ ] Documentation complete
- [ ] Phase 2 launch to 10 clients

---

# 7. PHASE 3: SOCIAL EXPANSION

## 7.1 Phase 3 Scope

**Deliverables:**
1. TikTok content generation and posting
2. Instagram content generation and posting
3. Email newsletter generation
4. Content scheduling

**Duration:** 2-3 weeks after Phase 2

## 7.2 Content Types

### 7.2.1 TikTok Content

```javascript
// Generate TikTok scripts and captions
async function generateTikTokContent(blogContent) {
  const script = await generateContent(
    `Create 3 different TikTok video scripts based on this blog:
    
    ${blogContent}
    
    Requirements for each:
    - 15-30 seconds
    - Engaging hook in first 2 seconds
    - Clear message
    - Call-to-action
    - Trending sounds/hashtags
    - Format: [HOOK] → [CONTENT] → [CTA]`
  );

  return script;
}
```

### 7.2.2 Instagram Content

```javascript
// Generate Instagram captions and hashtags
async function generateInstagramContent(blogContent) {
  const content = await generateContent(
    `Create Instagram post content based on this blog:
    
    ${blogContent}
    
    Requirements:
    - Caption (150-300 words)
    - 20-30 relevant hashtags
    - Call-to-action
    - Emoji usage
    - Line breaks for readability`
  );

  return content;
}
```

### 7.2.3 Email Newsletter

```javascript
// Generate email newsletter
async function generateEmailNewsletter(blogContent, clientName) {
  const content = await generateContent(
    `Create an email newsletter for ${clientName} based on this blog:
    
    ${blogContent}
    
    Requirements:
    - Subject line (50 characters max)
    - Preview text
    - Email body (HTML formatted)
    - Call-to-action button
    - Unsubscribe link
    - Professional template`
  );

  return content;
}
```

## 7.3 Phase 3 Implementation Checklist

- [ ] TikTok content generation implemented
- [ ] Instagram content generation implemented
- [ ] Email newsletter generation implemented
- [ ] Social media API integrations
- [ ] Content scheduling service
- [ ] Platform-specific optimization
- [ ] Frontend components for each platform
- [ ] Testing with 2-3 clients
- [ ] Documentation complete
- [ ] Phase 3 launch to 10 clients

---

# 8. PHASE 4: ADVANCED FEATURES

## 8.1 Phase 4 Scope

**Deliverables:**
1. Analytics dashboard
2. Performance tracking
3. A/B testing capabilities
4. Optimization recommendations
5. Client reporting

**Duration:** 2-3 weeks after Phase 3

## 8.2 Analytics Features

### 8.2.1 Content Performance Tracking

```javascript
// Track content performance
async function trackContentPerformance(contentId, metrics) {
  // Track views, clicks, conversions, engagement
  // Store in analytics table
  // Generate insights
}
```

### 8.2.2 Analytics Dashboard

```jsx
// Components/AnalyticsDashboard.jsx
// Display:
// - Total content generated
// - Total videos created
// - Performance metrics by platform
// - Top performing content
// - Revenue impact
// - Recommendations
```

## 8.3 Phase 4 Implementation Checklist

- [ ] Analytics data collection
- [ ] Dashboard components
- [ ] Performance tracking
- [ ] Reporting generation
- [ ] A/B testing framework
- [ ] Recommendation engine
- [ ] Testing with 2-3 clients
- [ ] Documentation complete
- [ ] Phase 4 launch to 10 clients

---

# 9. FRONTEND SPECIFICATIONS

## 9.1 Frontend Architecture

**Framework:** React 18+
**Styling:** TailwindCSS
**State Management:** Redux or Zustand
**Routing:** React Router v6
**HTTP Client:** Axios

## 9.2 Main Pages/Components

### 9.2.1 Dashboard

```
/dashboard
├── Overview (stats, recent projects)
├── Projects List
├── Quick Actions
└── Analytics Summary
```

### 9.2.2 Project Creation

```
/projects/new
├── Client Input Form
├── Form Validation
├── Submit & Queue
└── Progress Indicator
```

### 9.2.3 Project Details

```
/projects/:projectId
├── Project Overview
├── Content Tabs (Blog, LinkedIn, Ads, Videos)
├── Content Preview
├── Edit & Regenerate
├── Download Options
└── Publishing Options
```

### 9.2.4 Video Generator

```
/projects/:projectId/videos
├── Video Generation Form
├── Avatar Selection
├── Video Preview
├── Download & Share
└── Video History
```

### 9.2.5 Analytics

```
/analytics
├── Performance Overview
├── Content Performance
├── Platform Breakdown
├── Recommendations
└── Export Reports
```

## 9.3 UI/UX Best Practices

- **Breadcrumb Navigation:** Implement throughout for easy navigation
- **Loading States:** Show progress for long-running operations
- **Error Handling:** Clear error messages with recovery options
- **Responsive Design:** Mobile-friendly on all screen sizes
- **Accessibility:** WCAG 2.1 AA compliance

---

# 10. BACKEND SPECIFICATIONS

## 10.1 Backend Architecture

**Framework:** Express.js
**Language:** JavaScript/TypeScript
**Port:** 3001
**Environment:** Node.js 18+

## 10.2 API Endpoints

### Projects

```
POST   /api/projects/create          - Create new project
GET    /api/projects/:projectId      - Get project details
GET    /api/projects                 - List all projects
PUT    /api/projects/:projectId      - Update project
DELETE /api/projects/:projectId      - Delete project
```

### Content

```
GET    /api/projects/:projectId/content     - Get all content
GET    /api/content/:contentId              - Get specific content
PUT    /api/content/:contentId              - Update content
DELETE /api/content/:contentId              - Delete content
POST   /api/content/:contentId/regenerate   - Regenerate content
```

### Videos

```
POST   /api/videos/generate          - Generate video
GET    /api/videos/:projectId        - Get project videos
GET    /api/videos/job/:jobId        - Check job status
DELETE /api/videos/:videoId          - Delete video
```

### Analytics

```
GET    /api/analytics/:projectId     - Get project analytics
GET    /api/analytics/content/:contentId - Get content analytics
POST   /api/analytics/track          - Track metrics
```

## 10.3 Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
    },
  });
});
```

## 10.4 Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

# 11. CLAUDE PROMPTS

## 11.1 Competitor Analysis Prompt

```
Analyze these competitor URLs for the keyword "[KEYWORD]":

[PASTE COMPETITOR URLS AND CONTENT]

Please provide:
1. Their main strengths
2. Their weaknesses
3. Content gaps they're missing
4. Unique angle we can take
5. Keywords they're targeting
6. Content structure analysis
7. Recommendations for our content

Format as structured JSON.
```

## 11.2 Blog Content Generation Prompt

```
Create a comprehensive SEO-optimized blog post for the keyword "[KEYWORD]"

Target Audience: [DESCRIBE]
Unique Angle: [YOUR ANGLE]
Competitor Analysis: [GAPS IDENTIFIED]
Content Preferences: [TONE/STYLE]

Requirements:
- 3,500-4,500 words
- Optimized for Google SEO
- Optimized for Google AI Overviews
- Optimized for ChatGPT Search
- Optimized for Perplexity
- Optimized for Claude Search
- Optimized for Copilot

Include:
- SEO title (under 60 characters)
- Meta description (under 160 characters)
- Clear H2 and H3 headers
- Bullet points and lists
- Real examples and case studies
- Original insights or data
- Call-to-action
- Internal linking suggestions

Format as Markdown with frontmatter (title, metaDescription, keywords).
```

## 11.3 LinkedIn Post Generation Prompt

```
Create a professional LinkedIn post based on this blog topic: "[KEYWORD]"

Target Audience: [DESCRIBE]
Tone: [PROFESSIONAL/CASUAL/THOUGHT-LEADERSHIP]

Requirements:
- 150-300 words
- Engaging and professional
- Include 3-5 key takeaways
- Add clear call-to-action
- Include 5-10 relevant hashtags
- Emoji usage (2-3 max)
- Line breaks for readability

Format as plain text with hashtags at the end.
```

## 11.4 Google Ads Copy Generation Prompt

```
Create high-converting Google Search Ads copy for the keyword "[KEYWORD]"

Target Audience: [DESCRIBE]
Landing Page: [URL]
Unique Selling Point: [YOUR ANGLE]

Requirements:
- Headline 1 (30 characters max)
- Headline 2 (30 characters max)
- Headline 3 (30 characters max)
- Description 1 (90 characters max)
- Description 2 (90 characters max)
- Include unique value proposition
- Include call-to-action
- Keyword inclusion
- Urgency/benefit-driven

Format as JSON:
{
  "headlines": ["...", "...", "..."],
  "descriptions": ["...", "..."],
  "cta": "..."
}
```

## 11.5 Facebook Ads Copy Generation Prompt

```
Create high-converting Facebook Ads copy for the keyword "[KEYWORD]"

Target Audience: [DESCRIBE]
Landing Page: [URL]
Unique Selling Point: [YOUR ANGLE]

Requirements:
- Primary text (125 characters max)
- Headline (27 characters max)
- Description (30 characters max)
- Call-to-action button text
- Emoji usage (1-2 max)
- Benefit-driven messaging
- Urgency or scarcity

Format as JSON:
{
  "primaryText": "...",
  "headline": "...",
  "description": "...",
  "cta": "..."
}
```

## 11.6 Video Script Generation Prompt

```
Create a 30-second video script based on this blog content:

[PASTE BLOG CONTENT]

Requirements:
- 80-100 words
- Natural, conversational tone
- Engaging opening (first 3 seconds)
- Clear main message
- Call-to-action at the end
- Suitable for AI avatar voiceover
- Pacing for 30 seconds

Format as plain text with [PAUSE] markers for timing.
```

## 11.7 Email Newsletter Generation Prompt

```
Create an email newsletter based on this blog content:

[PASTE BLOG CONTENT]

Client Name: [CLIENT NAME]
Target Audience: [DESCRIBE]

Requirements:
- Subject line (50 characters max)
- Preview text (100 characters max)
- Email body (HTML formatted)
- 3-5 key points from blog
- Clear call-to-action button
- Professional template
- Mobile-friendly
- Unsubscribe link

Format as HTML with inline CSS.
```

---

# 12. IMPLEMENTATION GUIDE

## 12.1 Setup Instructions

### 12.1.1 Environment Setup

```bash
# Clone repository
git clone <repo-url>
cd tapverse-content-automation

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
CLAUDE_API_KEY=your_api_key
HEYGEN_API_KEY=your_api_key
ELEVENLABS_API_KEY=your_api_key
GOOGLE_ADS_API_KEY=your_api_key
FACEBOOK_ACCESS_TOKEN=your_token
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://user:password@localhost/tapverse
```

### 12.1.2 Database Setup

```bash
# Create database
createdb tapverse_content

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### 12.1.3 Start Development

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Job Queue Worker
npm run dev:worker

# Terminal 4: Redis
redis-server
```

## 12.2 Deployment

### 12.2.1 Production Deployment

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend

# Deploy to production
npm run deploy:production
```

### 12.2.2 Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

```bash
# Build and run Docker image
docker build -t tapverse-content-automation .
docker run -p 3001:3001 tapverse-content-automation
```

## 12.3 Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Check code coverage
npm run test:coverage
```

---

# 13. COST ANALYSIS

## 13.1 Monthly API Costs (Per Client)

| API | Usage | Cost/Month |
|-----|-------|-----------|
| Claude | 50 blog posts + 50 social posts | $15-20 |
| HeyGen | 10 videos (30 sec each) | $5-10 |
| ElevenLabs | 10 voiceovers (30 sec each) | $1-2 |
| Google Ads | Campaign management | $0 |
| Facebook Ads | Campaign management | $0 |
| Social APIs | Content posting | $0 |
| **Total** | | **$21-32** |

## 13.2 Infrastructure Costs

| Component | Cost/Month |
|-----------|-----------|
| Server (AWS t3.medium) | $30 |
| Database (RDS PostgreSQL) | $20 |
| Redis (ElastiCache) | $15 |
| S3 Storage (videos) | $10 |
| CDN (CloudFront) | $5 |
| **Total** | **$80** |

## 13.3 Total Monthly Cost

**For 10 Clients:**
- API Costs: $210-320
- Infrastructure: $80
- **Total: $290-400/month**

**Cost per Client: $29-40/month**

**Since no extra charge to clients, this is Tapverse's cost to provide the service.**

---

# 14. DEPLOYMENT STRATEGY

## 14.1 Staging Environment

1. Deploy Phase 1 to staging
2. Test with 2-3 internal clients
3. Gather feedback
4. Fix issues
5. Deploy to production

## 14.2 Production Rollout

**Week 1:** Phase 1 launch to 10 clients
**Week 3:** Phase 2 launch (AI videos)
**Week 5:** Phase 3 launch (Social expansion)
**Week 7:** Phase 4 launch (Advanced features)

## 14.3 Monitoring & Maintenance

```javascript
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

## 14.4 Backup & Recovery

- Daily database backups
- Weekly full system backups
- Recovery time objective (RTO): 1 hour
- Recovery point objective (RPO): 1 hour

---

# APPENDIX: QUICK REFERENCE

## A.1 Key File Structure

```
tapverse-content-automation/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClientInputForm.jsx
│   │   │   ├── ContentPreview.jsx
│   │   │   ├── VideoGenerator.jsx
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.js
│   │   │   ├── content.js
│   │   │   ├── videos.js
│   │   │   └── analytics.js
│   │   ├── services/
│   │   │   ├── claude.js
│   │   │   ├── heyGen.js
│   │   │   ├── elevenLabs.js
│   │   │   └── videoGeneration.js
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── queries.js
│   │   └── server.js
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## A.2 Important Reminders for Cursor

1. **Sequential Development:** Build Phase 1 completely before Phase 2
2. **API Keys:** All API keys are in .env file
3. **Database:** PostgreSQL schema is in db/schema.sql
4. **Job Queue:** Use Bull for async operations
5. **Error Handling:** Implement proper error handling throughout
6. **Testing:** Test each phase before moving to next
7. **Documentation:** Keep README updated
8. **Code Quality:** Follow ESLint rules
9. **Security:** Never commit API keys
10. **Performance:** Optimize queries and API calls

---

**End of Specification Document**

This document is your complete reference for building the Tapverse Content Automation System. Use it to guide your development with Cursor. Each phase is independent and deployable, allowing for incremental launches to your 10 clients.

Good luck with the build! 🚀
