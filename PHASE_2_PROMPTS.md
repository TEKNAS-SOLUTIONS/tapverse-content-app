# Tapverse Premium Content Automation System - Cursor Prompts

**Version 1.0 | Phase 2A, 2B, 2C | Production Ready**

---

## PHASE 2A: SEO STRATEGY GENERATION

### PROMPT 2A.1: Update Claude Model Configuration

**Instruction:** Update the Claude model configuration to use Claude Sonnet for all content generation tasks.

**File:** `backend/src/config/config.js`

**Change:**
```javascript
claudeModel: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
```

**Explanation:** This ensures all content generation uses Claude Sonnet instead of Haiku, providing superior strategic thinking and quality for SEO strategy generation, Google Ads strategy, Facebook Ads strategy, and Shopify optimization.

---

### PROMPT 2A.2: Create SEO Strategy Generation Service

**Instruction:** Create a new service that generates comprehensive SEO strategies (not just article ideas).

**File:** `backend/src/services/seoStrategyService.js`

**Functionality:**
- Generate comprehensive SEO strategies based on:
  - Client industry, target audience, competitors
  - Current website performance (if available)
  - Keyword research and gap analysis
  - Competitor content analysis
  - Industry trends and opportunities
- Output should include:
  - Primary and secondary keyword targets
  - Content pillar strategy
  - Content calendar recommendations
  - Technical SEO recommendations
  - Link building opportunities
  - Content gap analysis
  - Competitor content gaps
  - SEO-optimized content briefs

**Integration:**
- Use Claude Sonnet for strategic analysis
- Integrate with existing `articleIdeasService.js` for article ideas
- Save strategies to database (new table: `seo_strategies`)
- Link strategies to projects and clients

---

### PROMPT 2A.3: Create SEO Strategy Routes

**Instruction:** Create API routes for SEO strategy generation and management.

**File:** `backend/src/routes/seoStrategy.js`

**Endpoints:**
- `POST /api/seo-strategy/generate` - Generate new SEO strategy
- `GET /api/seo-strategy/project/:projectId` - Get strategies for a project
- `GET /api/seo-strategy/:id` - Get specific strategy
- `PUT /api/seo-strategy/:id` - Update strategy
- `DELETE /api/seo-strategy/:id` - Delete strategy

---

### PROMPT 2A.4: Create SEO Strategy Frontend Component

**Instruction:** Create frontend component to display and manage SEO strategies.

**File:** `frontend/src/components/SEOStrategy.jsx`

**Features:**
- Display generated SEO strategies
- Show keyword targets, content pillars, recommendations
- Allow regeneration of strategies
- Export strategies as PDF/JSON
- Link to article ideas generation

---

## PHASE 2B: GOOGLE ADS STRATEGY GENERATION

### PROMPT 2B.1: Create Google Ads Strategy Service

**Instruction:** Create a service to generate comprehensive Google Ads strategies.

**File:** `backend/src/services/googleAdsStrategyService.js`

**Functionality:**
- Generate Google Ads strategies including:
  - Campaign structure recommendations
  - Keyword research and match types
  - Ad copy variations
  - Landing page recommendations
  - Bid strategy recommendations
  - Budget allocation
  - A/B testing suggestions

---

### PROMPT 2B.2: Create Google Ads Strategy Routes

**Instruction:** Create API routes for Google Ads strategy generation.

**File:** `backend/src/routes/googleAdsStrategy.js`

**Endpoints:**
- `POST /api/google-ads-strategy/generate` - Generate strategy
- `GET /api/google-ads-strategy/project/:projectId` - Get strategies
- `PUT /api/google-ads-strategy/:id` - Update strategy

---

## PHASE 2C: FACEBOOK ADS STRATEGY GENERATION

### PROMPT 2C.1: Create Facebook Ads Strategy Service

**Instruction:** Create a service to generate comprehensive Facebook/Instagram Ads strategies.

**File:** `backend/src/services/facebookAdsStrategyService.js`

**Functionality:**
- Generate Facebook Ads strategies including:
  - Campaign objectives and structure
  - Audience targeting recommendations
  - Ad creative concepts
  - Placement recommendations
  - Budget and bidding strategies
  - A/B testing suggestions

---

### PROMPT 2C.2: Create Facebook Ads Strategy Routes

**Instruction:** Create API routes for Facebook Ads strategy generation.

**File:** `backend/src/routes/facebookAdsStrategy.js`

**Endpoints:**
- `POST /api/facebook-ads-strategy/generate` - Generate strategy
- `GET /api/facebook-ads-strategy/project/:projectId` - Get strategies
- `PUT /api/facebook-ads-strategy/:id` - Update strategy

---

## Database Schema Updates

### New Tables Required:

1. **`seo_strategies`**
   - `id` (UUID, primary key)
   - `client_id` (UUID, foreign key)
   - `project_id` (UUID, foreign key)
   - `primary_keywords` (TEXT[])
   - `secondary_keywords` (TEXT[])
   - `content_pillars` (JSONB)
   - `content_calendar` (JSONB)
   - `technical_seo_recommendations` (TEXT)
   - `link_building_opportunities` (JSONB)
   - `content_gap_analysis` (JSONB)
   - `competitor_gaps` (JSONB)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **`google_ads_strategies`**
   - Similar structure for Google Ads strategies

3. **`facebook_ads_strategies`**
   - Similar structure for Facebook Ads strategies

---

## Implementation Priority

1. **Phase 2A** - SEO Strategy Generation (Highest Priority)
2. **Phase 2B** - Google Ads Strategy Generation
3. **Phase 2C** - Facebook Ads Strategy Generation

---

## Notes

- All strategies should use Claude Sonnet for superior quality
- Strategies should be saved to database for future reference
- Frontend should allow regeneration and updates
- Export functionality (PDF/JSON) for client delivery

