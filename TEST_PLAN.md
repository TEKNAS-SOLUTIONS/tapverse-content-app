# Comprehensive Testing Plan - Phase 2D, 2E, 2F, 2G, 2H

## Test Environment Setup
- Backend: Node.js API server
- Frontend: React + Vite
- Database: PostgreSQL
- Date: $(date)

## Phase 2D: Breadcrumb Navigation

### Test Cases
1. ✅ **Breadcrumb Component Creation**
   - Component exists: `frontend/src/components/Breadcrumb.jsx`
   - Uses React Router hooks (useLocation, useParams)
   - Renders breadcrumb path with "/" separators

2. ✅ **Breadcrumb Integration**
   - Added to Layout component
   - Appears on all pages except Home
   - Positioned between header and main content

3. ✅ **Route Verification**
   - All routes properly configured in App.jsx
   - Dynamic routes use :paramName format
   - Breadcrumb paths correctly generated

### Expected Results
- Breadcrumbs display correctly on all pages
- Clickable links navigate to parent routes
- Current page is non-clickable
- Dynamic segments (client names, project names) load correctly

---

## Phase 2E: Business Type Support

### Test Cases

#### 2E.1: Database Migration
- [ ] Migration file exists: `007_add_business_types_to_clients.sql`
- [ ] Columns added: business_types, primary_business_type, location, shopify_url
- [ ] Indexes created for performance
- [ ] Existing records updated with default values

#### 2E.2: Client Form Updates
- [ ] Business type checkboxes displayed (General, Local, Shopify)
- [ ] Conditional fields appear based on selection:
  - Location field for Local business
  - Shopify URL field for Shopify store
- [ ] Validation works:
  - At least one business type required
  - Location required if Local selected
  - Shopify URL required and validated if Shopify selected
- [ ] Primary business type auto-selected when type added

#### 2E.3: API Validation
- [ ] POST /api/clients validates business_types array
- [ ] PUT /api/clients validates business_types array
- [ ] Conditional field validation (location, shopify_url)
- [ ] Returns appropriate error messages

#### 2E.4: Business Type Strategies
- [ ] General business strategy uses general prompt
- [ ] Local business strategy uses local prompt (GMB, citations, reviews)
- [ ] Shopify strategy uses e-commerce prompt (products, categories)
- [ ] Multi-type businesses handled correctly

#### 2E.5: Business Type UI Views
- [ ] Business type badges displayed in SEO Strategy component
- [ ] Location shown for local businesses
- [ ] Shopify URL shown for Shopify stores
- [ ] Business-type-specific focus areas displayed

---

## Phase 2F: Content Roadmap Visualization

### Test Cases

#### 2F.1: Roadmap Component
- [ ] Component exists: `frontend/src/components/ContentRoadmap.jsx`
- [ ] 12-month timeline displayed horizontally
- [ ] Current month highlighted
- [ ] Article cards show title, keyword, pillar, status
- [ ] Color-coded by pillar
- [ ] Status indicators (Planned/Generated/Published)

#### 2F.2: Drag and Drop
- [ ] Articles can be dragged between months
- [ ] Articles can be reordered within a month
- [ ] Changes saved to database
- [ ] Visual feedback during drag

#### 2F.3: Filtering
- [ ] Filter by pillar works
- [ ] Filter by cluster works
- [ ] Filter by status works
- [ ] Clear filters button works

#### 2F.4: Progress Tracking
- [ ] Total articles count displayed
- [ ] Generated articles count displayed
- [ ] Published articles count displayed
- [ ] Percentages calculated correctly

#### 2F.5: Quick Actions
- [ ] Generate Article button works
- [ ] Delete Article button works
- [ ] Confirmation dialog for delete

#### 2F.6: API Endpoints
- [ ] GET /api/roadmap/:projectId returns roadmap data
- [ ] PUT /api/roadmap/:projectId/reorder updates order
- [ ] POST /api/roadmap/:projectId/generate-article generates content
- [ ] DELETE /api/roadmap/:projectId/article/:articleId deletes article

#### 2F.7: Integration
- [ ] Roadmap tab added to ProjectDetail
- [ ] Roadmap loads from SEO strategy content calendar
- [ ] Articles populated from strategy data

---

## Phase 2G: Strategy Dashboard

### Test Cases

#### 2G.1: Dashboard Component
- [ ] Component exists: `frontend/src/components/StrategyDashboard.jsx`
- [ ] Strategy overview section displayed
- [ ] Strategy cards for SEO, Google Ads, Facebook Ads
- [ ] Progress bars show completion percentage
- [ ] Key metrics displayed for each strategy

#### 2G.2: Metrics Summary
- [ ] Total articles planned displayed
- [ ] Total articles generated displayed
- [ ] Total articles published displayed
- [ ] Expected traffic/conversions/revenue displayed

#### 2G.3: Quick Actions
- [ ] View Full Roadmap button links correctly
- [ ] Download PDF button (placeholder)
- [ ] Export Data button (placeholder)

#### 2G.4: Status Timeline
- [ ] Creation dates displayed
- [ ] Update dates displayed
- [ ] Status badges show correct colors

#### 2G.5: API Endpoint
- [ ] GET /api/dashboard/:projectId returns dashboard data
- [ ] Includes project, strategies, and summary
- [ ] Metrics calculated correctly

#### 2G.6: Integration
- [ ] Dashboard tab added to ProjectDetail
- [ ] Dashboard set as default tab
- [ ] Links to individual strategies work

---

## Phase 2H: Enhanced Content Preview

### Test Cases

#### 2H.1: Preview Component
- [ ] Component exists: `frontend/src/components/ContentPreview.jsx`
- [ ] Professional preview section displays article
- [ ] Title, meta description, content rendered
- [ ] Featured image placeholder shown

#### 2H.2: SEO Information Panel
- [ ] Target keyword highlighted
- [ ] Related keywords displayed
- [ ] Meta description with character count
- [ ] URL slug generated
- [ ] Internal/external linking suggestions shown

#### 2H.3: SEO Scores
- [ ] SEO Score displayed (0-100)
- [ ] Readability Score displayed (0-100)
- [ ] Keyword density shown
- [ ] Flesch-Kincaid level shown
- [ ] Color-coded scores (green/yellow/red)

#### 2H.4: Statistics Panel
- [ ] Word count displayed
- [ ] Reading time calculated
- [ ] Paragraph count shown
- [ ] Heading count shown

#### 2H.5: AI Search Optimization
- [ ] Google AI Overviews notes displayed
- [ ] ChatGPT Search notes displayed
- [ ] Perplexity notes displayed
- [ ] Claude Search notes displayed
- [ ] Copilot notes displayed

#### 2H.6: Quick Actions
- [ ] Edit Content button (placeholder)
- [ ] Download PDF button (placeholder)
- [ ] Copy to Clipboard works
- [ ] Schedule Publishing button (placeholder)
- [ ] View on Website button (placeholder)

#### 2H.7: Backend Services
- [ ] calculateSEOScore function works
- [ ] calculateReadabilityScore function works
- [ ] calculateStatistics function works
- [ ] getAISearchOptimizationNotes function works

#### 2H.8: API Integration
- [ ] GET /api/content/project/:projectId includes scores
- [ ] Scores calculated for each content item
- [ ] Statistics included in response
- [ ] AI search notes included in response

---

## Integration Tests

### End-to-End Workflows

1. **Create Client with Business Type**
   - Create client with Local business type
   - Add location
   - Verify business type saved correctly
   - Generate SEO strategy
   - Verify local-specific strategy generated

2. **Content Roadmap Workflow**
   - Generate SEO strategy
   - View roadmap tab
   - Verify articles populated from strategy
   - Drag article to different month
   - Verify order saved
   - Generate article from roadmap
   - Verify status updated

3. **Dashboard Overview**
   - Generate multiple strategies (SEO, Google Ads, Facebook Ads)
   - View dashboard
   - Verify all strategies displayed
   - Verify metrics calculated correctly
   - Click strategy card
   - Verify navigation to strategy detail

4. **Content Preview Workflow**
   - Generate blog content
   - View content preview
   - Verify SEO scores calculated
   - Verify statistics displayed
   - Verify AI search notes shown
   - Copy content to clipboard
   - Verify copy works

---

## Test Results Summary

### Passed: 0
### Failed: 0
### Pending: All tests

---

## Notes
- All tests should be run in a clean environment
- Database should be reset before testing
- Screenshots should be captured for visual verification
- Performance should be monitored during testing

