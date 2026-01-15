# Manual Testing Guide - Phase 2D, 2E, 2F, 2G, 2H

## Prerequisites

1. ✅ Database migration run: `007_add_business_types_to_clients.sql`
2. ✅ Backend server running
3. ✅ Frontend server running
4. ✅ Database connected

---

## Phase 2D: Breadcrumb Navigation

### Test Steps
1. Navigate to Home page
   - ✅ Should NOT show breadcrumb (home page)

2. Navigate to Clients page
   - ✅ Breadcrumb shows: `Home / Clients`
   - ✅ "Home" is clickable
   - ✅ "Clients" is not clickable (current page)

3. Navigate to a Project Detail page
   - ✅ Breadcrumb shows: `Home / Projects / [Project Name]`
   - ✅ All segments clickable except current page

4. Navigate to SEO Strategy tab
   - ✅ Breadcrumb shows: `Home / Projects / [Project Name] / SEO Strategy`
   - ✅ Clicking "Projects" navigates to projects list
   - ✅ Clicking project name navigates to project detail

5. Test all tabs in Project Detail
   - ✅ Breadcrumb updates correctly for each tab
   - ✅ SEO Strategy, Google Ads, Facebook Ads, Ideas, Roadmap, etc.

---

## Phase 2E: Business Type Support

### Test Steps

#### 1. Create Client with General Business Type
1. Go to Clients page → Create Client
2. Fill in basic info
3. In Business Type section:
   - ✅ Check "General Business"
   - ✅ Industry field should be visible
   - ✅ Location field should NOT be visible
   - ✅ Shopify URL field should NOT be visible
4. Submit form
   - ✅ Client created successfully
   - ✅ Business type saved as "general"

#### 2. Create Client with Local Business Type
1. Create new client
2. Check "Local Business"
   - ✅ Location field appears
   - ✅ Location field is required (validation)
3. Enter location: "New York, NY"
4. Submit form
   - ✅ Client created with business_type: ["local"]
   - ✅ Location saved

#### 3. Create Client with Shopify Business Type
1. Create new client
2. Check "Shopify Store"
   - ✅ Shopify URL field appears
   - ✅ Shopify URL field is required (validation)
3. Enter URL: "https://store.myshopify.com"
4. Submit form
   - ✅ Client created with business_type: ["shopify"]
   - ✅ Shopify URL saved

#### 4. Create Client with Multiple Business Types
1. Create new client
2. Check both "General" and "Local"
   - ✅ Both fields visible
   - ✅ Location required
3. Set primary type (first checked becomes primary)
4. Submit form
   - ✅ Multiple business types saved
   - ✅ Primary type set correctly

#### 5. Generate SEO Strategy for Local Business
1. Create project for local business client
2. Go to SEO Strategy tab
3. Generate SEO Strategy
   - ✅ Strategy generated with local focus
   - ✅ Includes GMB optimization, local citations, reviews
   - ✅ Location-specific keywords

#### 6. Generate SEO Strategy for Shopify Business
1. Create project for Shopify client
2. Generate SEO Strategy
   - ✅ Strategy generated with e-commerce focus
   - ✅ Includes product pages, categories, buying guides
   - ✅ Commercial keywords

#### 7. View Business Type in SEO Strategy UI
1. View generated SEO strategy
2. Check business type badges
   - ✅ Business type badges displayed
   - ✅ Location shown for local businesses
   - ✅ Shopify URL shown for Shopify stores
   - ✅ Business-type-specific focus areas displayed

---

## Phase 2F: Content Roadmap Visualization

### Test Steps

#### 1. Generate SEO Strategy First
1. Go to a project
2. Generate SEO Strategy
   - ✅ Strategy generated with content calendar

#### 2. View Content Roadmap
1. Click "Content Roadmap" tab
2. Verify roadmap loads
   - ✅ 12-month timeline displayed
   - ✅ Current month highlighted
   - ✅ Articles populated from SEO strategy
   - ✅ Articles show title, keyword, pillar, status

#### 3. Test Filtering
1. Filter by Pillar
   - ✅ Only articles from selected pillar shown
2. Filter by Status
   - ✅ Only articles with selected status shown
3. Filter by Cluster
   - ✅ Only articles from selected cluster shown
4. Clear Filters
   - ✅ All articles shown again

#### 4. Test Drag and Drop
1. Drag an article from one month to another
   - ✅ Article moves visually
   - ✅ Order saved (check after refresh)
2. Reorder articles within same month
   - ✅ Order changes
   - ✅ Order saved

#### 5. Test Progress Tracking
1. Check progress metrics
   - ✅ Total articles count correct
   - ✅ Generated articles count correct
   - ✅ Published articles count correct
   - ✅ Percentages calculated correctly

#### 6. Test Quick Actions
1. Click "Generate" on a planned article
   - ✅ Article generation starts
   - ✅ Status updates to "generated"
2. Click "Delete" on an article
   - ✅ Confirmation dialog appears
   - ✅ Article deleted after confirmation

---

## Phase 2G: Strategy Dashboard

### Test Steps

#### 1. View Dashboard (Default Tab)
1. Open a project
2. Dashboard should be default tab
   - ✅ Dashboard loads automatically
   - ✅ Shows project overview

#### 2. Generate Multiple Strategies
1. Generate SEO Strategy
2. Generate Google Ads Strategy
3. Generate Facebook Ads Strategy
   - ✅ All strategies appear on dashboard

#### 3. Verify Strategy Cards
1. Check SEO Strategy card
   - ✅ Progress bar displayed
   - ✅ Articles planned/generated/published shown
   - ✅ Expected traffic shown
   - ✅ "View Strategy" button works
2. Check Google Ads Strategy card
   - ✅ Estimated budget shown
   - ✅ Estimated clicks/conversions shown
   - ✅ ROI shown
3. Check Facebook Ads Strategy card
   - ✅ Estimated budget shown
   - ✅ Estimated reach/conversions shown
   - ✅ Cost per result shown

#### 4. Verify Metrics Summary
1. Check summary section
   - ✅ Total articles planned
   - ✅ Total articles generated
   - ✅ Total articles published
   - ✅ Expected traffic
   - ✅ Expected conversions
   - ✅ Expected revenue

#### 5. Test Quick Actions
1. Click "View Full Roadmap"
   - ✅ Navigates to roadmap tab
2. Click "Download Strategy (PDF)"
   - ✅ Placeholder (not implemented yet)
3. Click "Export Data"
   - ✅ Placeholder (not implemented yet)

#### 6. Verify Status Timeline
1. Check timeline section
   - ✅ Creation dates shown
   - ✅ Update dates shown
   - ✅ Status badges with correct colors

---

## Phase 2H: Enhanced Content Preview

### Test Steps

#### 1. Generate Blog Content
1. Go to project
2. Generate blog content
   - ✅ Content generated successfully

#### 2. View Content Preview
1. Open ContentPreview component (integrate into ContentGenerator)
2. Verify preview section
   - ✅ Title displayed
   - ✅ Meta description displayed
   - ✅ Content rendered properly
   - ✅ Featured image placeholder shown

#### 3. Verify SEO Information Panel
1. Check SEO Information section
   - ✅ Target keyword highlighted
   - ✅ Related keywords displayed
   - ✅ Meta description with character count
   - ✅ URL slug generated
   - ✅ Internal/external linking suggestions

#### 4. Verify SEO Scores
1. Check SEO Scores section
   - ✅ SEO Score displayed (0-100)
   - ✅ Readability Score displayed (0-100)
   - ✅ Color-coded (green/yellow/red)
   - ✅ Progress bars displayed
   - ✅ Keyword density shown
   - ✅ Flesch-Kincaid level shown

#### 5. Verify Statistics Panel
1. Check Statistics section
   - ✅ Word count displayed
   - ✅ Reading time calculated
   - ✅ Paragraph count shown
   - ✅ Heading count shown

#### 6. Verify AI Search Optimization Notes
1. Check AI Search Optimization section
   - ✅ Google AI Overviews notes
   - ✅ ChatGPT Search notes
   - ✅ Perplexity notes
   - ✅ Claude Search notes
   - ✅ Copilot notes

#### 7. Test Quick Actions
1. Click "Copy to Clipboard"
   - ✅ Content copied successfully
2. Other actions (Edit, Download PDF, Schedule, View on Website)
   - ✅ Placeholders (not fully implemented yet)

#### 8. Verify API Integration
1. Check network tab when loading content
   - ✅ API response includes seo_score
   - ✅ API response includes readability_score
   - ✅ API response includes statistics
   - ✅ API response includes ai_search_notes

---

## Integration Testing

### End-to-End Workflow 1: Local Business
1. Create client with Local business type
2. Add location
3. Create project
4. Generate SEO Strategy
   - ✅ Local-specific strategy generated
5. View Dashboard
   - ✅ Business type badges shown
   - ✅ Location displayed
6. View Roadmap
   - ✅ Articles populated
7. Generate article from roadmap
   - ✅ Article generated
   - ✅ Status updated

### End-to-End Workflow 2: Shopify Business
1. Create client with Shopify business type
2. Add Shopify URL
3. Create project
4. Generate SEO Strategy
   - ✅ E-commerce strategy generated
5. View Dashboard
   - ✅ Shopify badge shown
   - ✅ Shopify URL displayed
6. View Content Preview
   - ✅ SEO scores calculated
   - ✅ Statistics displayed

### End-to-End Workflow 3: Multiple Strategies
1. Create project
2. Generate all strategies (SEO, Google Ads, Facebook Ads)
3. View Dashboard
   - ✅ All strategies displayed
   - ✅ Metrics summary accurate
4. Navigate between strategies
   - ✅ All tabs work correctly
   - ✅ Breadcrumbs update

---

## Known Issues / Placeholders

1. **ContentPreview Component**
   - Not yet integrated into ContentGenerator
   - Needs to be added to content display flow

2. **Quick Actions**
   - Download PDF: Placeholder
   - Export Data: Placeholder
   - Schedule Publishing: Placeholder
   - View on Website: Placeholder

3. **Roadmap API**
   - Some endpoints are simplified
   - Full roadmap_articles table may be needed for production

4. **Dashboard Metrics**
   - Some metrics are estimated/placeholder
   - Real metrics calculation may need refinement

---

## Performance Testing

1. **SEO Score Calculation**
   - Test with large content (5000+ words)
   - Verify calculation speed

2. **Roadmap Loading**
   - Test with 100+ articles
   - Verify rendering performance

3. **Dashboard Loading**
   - Test with multiple strategies
   - Verify metrics calculation speed

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (responsive design)

---

## Success Criteria

All features should:
- ✅ Load without errors
- ✅ Display correctly
- ✅ Function as expected
- ✅ Save data correctly
- ✅ Navigate correctly
- ✅ Show appropriate loading states
- ✅ Handle errors gracefully

---

## Reporting Issues

When reporting issues, include:
1. Feature/Phase tested
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser/OS information
6. Console errors (if any)
7. Network errors (if any)

