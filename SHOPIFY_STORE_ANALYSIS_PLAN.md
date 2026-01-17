# Shopify Store Analysis Integration Plan

## 🎯 Overview

Connect Shopify stores to the app and perform comprehensive SEO + sales analysis using:
- **Shopify Admin API** - Fetch real store data (products, collections, pages)
- **DataForSEO API** - Get real keyword data for products/collections
- **Claude AI** - Analyze and generate actionable recommendations

---

## 📋 What We'll Build

### 1. Shopify API Integration
- Connect to Shopify Admin API
- Fetch products (titles, descriptions, tags, variants, images, pricing)
- Fetch collections (category pages)
- Fetch pages (blog posts, static pages)
- Fetch store metadata (theme, settings)

### 2. Store Analysis Engine
- **SEO Analysis:**
  - Product page SEO audit (titles, descriptions, meta tags)
  - Collection page optimization
  - Image SEO (alt text, file names)
  - Schema markup analysis
  - Internal linking structure
  - URL structure analysis

- **Keyword Analysis (DataForSEO):**
  - Real search volumes for product keywords
  - Real CPC data (commercial value)
  - Competition levels
  - Keyword opportunities per product
  - Missing keyword opportunities

- **AI-Powered Recommendations:**
  - Product title optimization
  - Product description improvements
  - Missing meta descriptions
  - Image alt text suggestions
  - Schema markup recommendations
  - Internal linking improvements
  - Collection page optimization
  - Content gap analysis

- **Sales Optimization:**
  - High-value product identification (high CPC keywords)
  - Product prioritization (by search volume + commercial value)
  - Pricing strategy suggestions
  - Bundle opportunities
  - Cross-selling recommendations

### 3. Database Schema
- `shopify_stores` - Store connection info
- `shopify_products` - Product data snapshot
- `shopify_collections` - Collection data
- `shopify_analyses` - Analysis results and recommendations

### 4. API Endpoints
- `POST /api/shopify/connect` - Connect Shopify store
- `GET /api/shopify/stores/:clientId` - Get store info
- `POST /api/shopify/analyze/:clientId` - Run full store analysis
- `GET /api/shopify/analysis/:analysisId` - Get analysis results
- `GET /api/shopify/products/:storeId` - Get products
- `GET /api/shopify/recommendations/:analysisId` - Get recommendations

### 5. Frontend Components
- Shopify connection form (API key + store URL)
- Store analysis dashboard
- Product-by-product recommendations
- Priority recommendations (high impact)
- Implementation checklist

---

## 🔧 Technical Implementation

### Shopify API Requirements

**Required Scopes:**
- `read_products` - Read product data
- `read_product_listings` - Read product listings
- `read_content` - Read pages, blog posts
- `read_themes` - Read theme info (optional)

**Authentication:**
- Admin API access token
- Store URL (e.g., `store.myshopify.com`)

**Rate Limits:**
- 2 requests/second (40 requests per 20 seconds)
- Need to implement rate limiting and batching

### DataForSEO Integration
- Use existing `dataForSeoService.js`
- Batch keyword analysis for all products
- Cache results (already implemented)
- Focus on commercial/product keywords

### AI Analysis
- Use Claude Sonnet for deep analysis
- Multi-pass analysis:
  1. SEO audit pass
  2. Keyword opportunity pass
  3. Sales optimization pass
  4. Synthesis and recommendations

---

## 📊 Analysis Output Structure

```json
{
  "store_summary": {
    "total_products": 150,
    "total_collections": 12,
    "total_pages": 25,
    "analysis_date": "2025-01-XX"
  },
  "seo_score": 72,
  "overall_recommendations": [
    {
      "priority": "high",
      "category": "product_seo",
      "title": "Optimize 45 product titles",
      "impact": "high",
      "effort": "medium"
    }
  ],
  "product_analyses": [
    {
      "product_id": "123",
      "product_title": "Current Title",
      "seo_score": 65,
      "keyword_opportunities": [
        {
          "keyword": "best running shoes",
          "search_volume": 12000,
          "cpc": 2.45,
          "current_rank": null,
          "opportunity": "high"
        }
      ],
      "recommendations": [
        {
          "type": "title_optimization",
          "current": "Running Shoes",
          "suggested": "Best Running Shoes for Men 2025 - Comfort & Performance",
          "reason": "Includes high-volume keyword, year, benefits"
        }
      ]
    }
  ],
  "collection_analyses": [...],
  "sales_opportunities": [
    {
      "type": "high_value_product",
      "product_id": "123",
      "reason": "High CPC keywords ($3.50) indicate strong commercial intent",
      "recommendation": "Prioritize SEO optimization, consider featured placement"
    }
  ]
}
```

---

## 🚀 Implementation Phases

### Phase 1: Shopify Connection (Day 1)
- Shopify API service
- Store connection endpoint
- Basic product fetching

### Phase 2: Store Analysis (Day 2-3)
- Product SEO audit
- DataForSEO keyword analysis
- AI recommendation generation

### Phase 3: Recommendations Engine (Day 4)
- Priority scoring
- Implementation checklist
- Actionable recommendations

### Phase 4: Frontend (Day 5)
- Connection UI
- Analysis dashboard
- Recommendations display

---

## 💡 Key Features

1. **Automated SEO Audit**
   - Every product analyzed
   - Missing metadata identified
   - Optimization opportunities flagged

2. **Real Keyword Data**
   - Actual search volumes
   - Real CPC (commercial value)
   - Competition levels

3. **AI-Powered Suggestions**
   - Optimized titles
   - Better descriptions
   - Schema markup
   - Internal linking

4. **Sales Optimization**
   - High-value product identification
   - Bundle opportunities
   - Cross-selling suggestions

5. **Priority Scoring**
   - High impact, low effort first
   - ROI-based prioritization
   - Quick wins highlighted

---

## 📝 What I Need From You

1. **Shopify API Credentials** (when ready to test):
   - Admin API access token
   - Store URL
   - Or instructions for OAuth flow

2. **Preferred Analysis Scope:**
   - All products or sample?
   - Include collections?
   - Include blog pages?

3. **Recommendation Preferences:**
   - Auto-generate optimized content?
   - Or just recommendations?
   - Export format (CSV, JSON, PDF)?

---

**Status:** Ready to implement! 🚀
