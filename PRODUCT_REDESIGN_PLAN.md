# Product Redesign & Enhancement Plan

## 📋 Current Issues to Address

### 1. **500 Error on Project View** ⚠️
**Status:** Need to investigate  
**Issue:** When clicking "View" on a project, server returns 500 error  
**Action Required:** Check backend logs and fix API endpoint

### 2. **Missing Local SEO** 📍
**Current State:** 
- Local SEO exists in codebase (`LocalSeoAnalysis` component)
- Only visible when `client.primary_business_type === 'local'`
- Not visible in navigation or easily accessible

**Issue:** Cannot see Local SEO anywhere - needs better visibility  
**Proposed Solution:** Add Local SEO to client dashboard regardless of business type, or make it accessible from navigation

---

## 🎨 Layout Redesign (Major Update)

### **Current Layout:**
- Top navigation bar with all links
- Breadcrumb navigation
- No clear hierarchy

### **Proposed Layout:**
```
┌─────────────────────────────────────────────────┐
│  Logo              [User Menu]                  │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│  LEFT    │         MAIN CONTENT AREA            │
│  SIDEBAR │                                      │
│          │                                      │
│  🏠 Home │                                      │
│  👥 Clients                                     │
│  ⚙️  Settings                                    │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### **Left Navigation Bar:**
1. **🏠 Home** - Dashboard overview
2. **👥 Clients** - Client management (see below)
3. **⚙️ Settings** - Admin settings (see below)

---

## 👥 Clients Dashboard Redesign

### **Current State:**
- Simple list of clients
- Basic filtering

### **Proposed Structure:**

#### **Default View (All Clients):**
```
┌─────────────────────────────────────────────┐
│  Clients Dashboard                          │
├─────────────────────────────────────────────┤
│  [All Clients ▼]  [+ Add Client]            │
├─────────────────────────────────────────────┤
│  📊 METRICS                                 │
│  ┌─────────┬─────────┬─────────┬─────────┐ │
│  │ Total   │ Active  │ Projects│ Revenue │ │
│  │ Clients │ Projects│         │         │ │
│  │   25    │   12    │   45    │ $50K    │ │
│  └─────────┴─────────┴─────────┴─────────┘ │
│                                             │
│  📈 Client Performance Chart                │
│  [Visual chart showing client metrics]      │
│                                             │
│  📋 Client List (Table/Cards)               │
│  - Client Name | Industry | Projects | ... │
│  - Clickable rows to view client details   │
└─────────────────────────────────────────────┘
```

#### **Client-Specific View (SEMrush-style Dashboard):**

```
┌─────────────────────────────────────────────────────────────┐
│  [Client Name ▼]                    [📥 Export] [📊 Report] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 KEY METRICS (Top Cards)                                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐      │
│  │ Active  │ Content │Keywords │Ranking  │ Traffic │      │
│  │Projects │Generated│Tracked  │Changes  │  Est.   │      │
│  │   12    │   45    │   38    │   +5    │  5.2K   │      │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘      │
│                                                             │
│  📈 MONTH-ON-MONTH GRAPHS                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Rankings Trend (6 months)        [📥 Export]       │  │
│  │                                                     │  │
│  │  10│    ●                                      ●    │  │
│  │   8│  ●   ●                                 ●       │  │
│  │   6│●      ● ●        ●                 ●          │  │
│  │   4│         ●   ●  ●   ● ●          ●             │  │
│  │   2│                 ●     ●     ●                 │  │
│  │   0└─────────────────────────────────────────────  │  │
│  │     Jan  Feb  Mar  Apr  May  Jun                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Content Generated Trend              [📥 Export]   │  │
│  │  [Similar graph showing content volume over time]   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  🔑 KEYWORD RANK TRACKING                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Keyword          | Current | Previous | Change      │  │
│  │────────────────────────────────────────────────────│  │
│  │ seo optimization |    #3   |    #5    |  +2 ↑      │  │
│  │ content strategy |    #7   |    #8    |  +1 ↑      │  │
│  │ keyword research |   #12   |   #15    |  +3 ↑      │  │
│  │ ...              |         |          |             │  │
│  │ [View All 38 Keywords]                [📥 Export]   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  💡 CONTENT IDEAS & GAPS (AI + DataForSEO)                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🎯 High Opportunity Keywords (Not Yet Targeted)     │  │
│  │    - "content automation tools" (Vol: 2.4K)         │  │
│  │    - "seo content generator" (Vol: 1.8K)            │  │
│  │    [Generate Content] [Add to Keywords]             │  │
│  │                                                     │  │
│  │ 📊 Competitor Content Gaps                          │  │
│  │    - "best seo practices 2024" (Competitors rank #3)│  │
│  │    - Opportunity to create better content           │  │
│  │                                                     │  │
│  │ 💰 Upsell Opportunities                             │  │
│  │    - Local SEO: 15 high-intent local keywords      │  │
│  │    - Video Content: 8 topics suitable for video    │  │
│  │    [View Details] [Start Project]                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  📋 SECTIONS (Expandable Cards/Tabs)                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📁 Projects (12)          [View All] [➕ New]       │  │
│  │    Recent: Project A, Project B, Project C...       │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ ✓ Tasks (Monthly + Adhoc) [View All] [➕ New]      │  │
│  │    🔄 Monthly: SEO Audit (Due: Jan 31)              │  │
│  │    📝 Adhoc: Review new keywords (Assigned: John)   │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 🔌 Connections           [Manage]                   │  │
│  │    ✅ Google Analytics    ✅ Google Search Console   │  │
│  │    ❌ Facebook Ads        ❌ Shopify                 │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 🔑 Keywords (38 tracked) [View All] [➕ Add]       │  │
│  │    [Rank tracking table above]                      │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 📍 Local SEO              [View Analysis]           │  │
│  │    [Available for all clients]                      │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 📊 Overall Strategy       [View Full Strategy]      │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 📅 Content Schedule       [View Calendar]           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Data-rich dashboard** similar to SEMrush
- **Rank tracking** with month-on-month comparisons
- **Graphs and charts** for visual metrics
- **Export options** throughout (keywords, reports, data)
- **Content ideas/gaps** powered by AI + DataForSEO (upsell opportunities)
- **Task management** with monthly recurring + adhoc tasks
- **Team assignment** for tasks

**Key Features:**
- Dropdown at top: `[All Clients ▼]` → Select client → Shows client-specific dashboard
- Metrics cards: Total clients, active projects, revenue, etc.
- Each section is expandable/clickable to show more details
- Conditional display based on services enabled for client

---

## ⚙️ Settings Page (Admin Level)

### **Proposed Structure:**

```
┌─────────────────────────────────────────────┐
│  Settings                                    │
├─────────────────────────────────────────────┤
│  TABS:                                       │
│  [API Keys] [Users] [General] [Integrations]│
├─────────────────────────────────────────────┤
│                                             │
│  🔑 API KEYS & CONFIGURATION                │
│  ┌───────────────────────────────────────┐ │
│  │ Claude API Key: [••••••••] [Edit]     │ │
│  │ DataForSEO: [••••••••] [Edit]         │ │
│  │ Google Autocomplete API: [••••••••]   │ │
│  │ Other API Keys...                      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  👥 USER MANAGEMENT                         │
│  ┌───────────────────────────────────────┐ │
│  │ [Add User]                             │ │
│  │                                         │ │
│  │ Users Table:                            │ │
│  │ - Name | Email | Role | Status | Actions│
│  │ - Role: Admin, Manager, Editor          │ │
│  │ - Actions: Edit, Delete, Reset Password │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  🔐 AUTHENTICATION & PERMISSIONS            │
│  - Enable/disable login system              │
│  - OAuth providers (Google, etc.)           │
│  - Permission levels per role               │
│                                             │
│  🔌 INTEGRATIONS                            │
│  - Default connection settings              │
│  - Webhook configurations                   │
│  - Third-party app connections              │
└─────────────────────────────────────────────┘
```

**Key Features:**
- **API Keys Management:** Secure storage and management of all API keys
- **User Management:** Add/edit/delete team members, assign roles
- **Authentication:** Setup login system for team members
- **Permissions:** Role-based access control (Admin, Manager, Editor)

---

## 🔑 Keyword Analysis Enhancement

### **Current Limitation:**
- Only showing 3 keywords (from `summary.top_priorities`)
- Limited output not practical for real use

### **Proposed Enhancement:**

#### **1. Comprehensive Keyword Research:**
- **Minimum 20-50 keywords** per analysis (not just 3)
- **Keyword Categories:**
  - Primary Keywords (5-10)
  - Secondary Keywords (10-20)
  - Long-Tail Keywords (20-30+)
  - Competitor Gap Keywords (10-20)
  - Industry Trend Keywords (5-10)
  - Quick Win Keywords (10-15)

#### **2. Enhanced Output:**
- **Detailed metrics per keyword:**
  - Search volume estimate
  - Keyword difficulty
  - Competition level
  - Search intent (Informational, Commercial, Transactional)
  - Trend direction (Rising, Stable, Declining)
  - Opportunity score (0-100)
  - Time to rank estimate
  - Potential traffic estimate

#### **3. Keyword Selection Interface:**
```
┌─────────────────────────────────────────────┐
│  Keywords from Analysis                     │
├─────────────────────────────────────────────┤
│  [Select All] [Deselect All] [Filter ▼]    │
│                                             │
│  ☑ Keyword 1    [Vol: High] [Diff: 45] ... │
│  ☐ Keyword 2    [Vol: Med]  [Diff: 30] ... │
│  ☑ Keyword 3    [Vol: Low]  [Diff: 25] ... │
│  ... (50+ keywords)                         │
│                                             │
│  Selected: 12 keywords                      │
│  [Generate Content with Selected]           │
└─────────────────────────────────────────────┘
```

#### **4. Keyword-Based Content Generation:**
- After analysis, user selects keywords (checkboxes)
- Content generation uses selected keywords
- AI recommendations for additional keywords
- Bulk content generation for multiple keywords

---

## ✨ Content Generation Enhancement

### **Current Flow:**
- User generates content
- Keywords may not be considered

### **Proposed Flow:**

#### **1. Keyword Selection First:**
```
1. Run Keyword Analysis
   ↓
2. Review Keywords (50+ options)
   ↓
3. Select Keywords (checkbox interface)
   ↓
4. AI Recommendations appear
   ↓
5. Generate Content based on selected keywords
```

#### **2. Content Generation Options:**
- **Single Keyword:** Generate one piece per keyword
- **Keyword Cluster:** Generate one piece covering multiple related keywords
- **Bulk Generation:** Generate content for all selected keywords (queue-based)

#### **3. AI Recommendations:**
- Suggest related keywords not in original analysis
- Suggest keyword combinations
- Suggest content angles based on keywords

---

## 📍 Programmatic SEO Feature

### **New Feature Request:**

#### **Use Case:**
Generate content for Services/Locations automatically
- Example: "Plumber in [Suburb]" for all suburbs
- Example: "[Service] in [Location]" variations

#### **Proposed Interface:**
```
┌─────────────────────────────────────────────┐
│  Programmatic SEO Content Generator         │
├─────────────────────────────────────────────┤
│                                             │
│  Content Type:                              │
│  ○ Service Pages                            │
│  ○ Location Pages                           │
│  ○ Service + Location Pages                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ SERVICE SELECTION                     │ │
│  │ [Service 1] [Service 2] [Service 3]   │ │
│  │ [+ Add Service]                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ LOCATION INPUT                        │ │
│  │                                        │ │
│  │ Enter suburb/location:                 │ │
│  │ [____________________] [🔍 Auto-fill] │ │
│  │                                        │ │
│  │ Selected Locations:                    │ │
│  │ - Melbourne CBD                        │ │
│  │ - South Yarra                          │ │
│  │ - St Kilda                             │ │
│  │ [+ Add More]                           │ │
│  │                                        │ │
│  │ Bulk Add:                              │ │
│  │ [Paste locations (one per line)]      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Generate All Content]                     │
│                                             │
│  Preview Template:                          │
│  "[Service] in [Location]"                  │
│  Example: "Plumber in Melbourne CBD"        │
└─────────────────────────────────────────────┘
```

#### **Features:**
1. **Google Autocomplete API Integration:**
   - Type location → Auto-fill suggestions
   - Validates locations
   - Prevents duplicates

2. **Bulk Location Entry:**
   - Paste list of suburbs/locations
   - One per line
   - Validate all at once

3. **Content Generation:**
   - Generate unique content for each Service+Location combination
   - Maintain SEO optimization
   - Avoid duplicate content

4. **Template System:**
   - Define templates: "[Service] in [Location]"
   - Customize for different content types

5. **Queue Management:**
   - Large batches go to queue
   - Progress tracking
   - Email notification when complete

---

## 📥 Export Functionality

### **What Can Be Exported:**
- ✅ **Keyword Data:** Full keyword list with metrics (CSV, Excel, PDF)
- ✅ **Rank Tracking Data:** Historical ranking data (CSV, Excel)
- ✅ **Content Generated:** All content pieces with metadata (CSV, PDF, DOCX)
- ✅ **Analytics Data:** Traffic, engagement metrics (CSV, Excel)
- ✅ **Client Reports:** Comprehensive client reports (PDF)
- ✅ **Monthly Reports:** Automated monthly reports (PDF)
- ✅ **Graphs/Charts:** Export as images (PNG, SVG)
- ✅ **Raw Data:** JSON export for technical users

### **Export Options Throughout Interface:**
- **Export buttons** on every data table
- **Bulk export** for multiple items
- **Date range selection** for historical data
- **Format options:** CSV, Excel, PDF, JSON
- **Customizable columns** for CSV/Excel exports

### **Export Implementation:**
```javascript
// Export endpoints
GET /api/export/keywords?clientId=X&format=csv
GET /api/export/rankings?clientId=X&startDate=Y&endDate=Z
GET /api/export/content?projectId=X&format=pdf
GET /api/export/report/monthly?clientId=X&month=Y
```

---

## 📊 Monthly Report Generation

### **Challenge:**
Not all generated content is used/published. Need smart mechanism to include only relevant data in reports.

### **Proposed Solution: Multi-Stage Report Generation**

#### **1. Content Status Tracking:**
```
Content Statuses:
- ✏️  Draft (Generated but not reviewed)
- 👀 In Review (Being reviewed by team)
- ✅ Approved (Ready to publish)
- 📅 Scheduled (Scheduled for publication)
- 🟢 Published (Live on website/social)
- ❌ Rejected (Not used)
- 📝 Edited (Modified from original)
```

#### **2. Report Content Selection:**

**Automatic Inclusion:**
- ✅ **Published Content** (automatically included)
- ✅ **Scheduled Content** (with scheduled date)
- ✅ **Approved Content** (marked for publication)

**Optional/Manual Selection:**
- 👀 **In Review Content** (Manager can include/exclude)
- 📝 **Drafted Content** (Manager can select relevant ones)
- ❌ **Rejected Content** (Excluded by default, but can be included with note)

**Always Included (Regardless of Status):**
- 📊 **Metrics:** Rankings, traffic, keyword performance
- 📈 **Charts:** Month-on-month comparisons
- 🔑 **Keyword Tracking:** All tracked keywords with rank changes
- 📊 **Content Statistics:** Total generated, published, scheduled
- 💡 **Content Ideas/Gaps:** AI recommendations for next month

#### **3. Monthly Report Sections:**

```
┌─────────────────────────────────────────────────┐
│  MONTHLY REPORT: [Client Name]                  │
│  Period: January 2026                           │
│  Generated: Feb 1, 2026                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 EXECUTIVE SUMMARY                           │
│  - Rankings improved by +5 positions            │
│  - 12 pieces of content published               │
│  - 3 new keywords ranking in top 20             │
│  - Traffic increased by 15%                     │
│                                                 │
│  📈 PERFORMANCE METRICS                         │
│  - Month-on-month ranking graphs                │
│  - Traffic trends                               │
│  - Content generation stats                     │
│                                                 │
│  🔑 KEYWORD PERFORMANCE                         │
│  - Top performing keywords                      │
│  - New keywords ranking                         │
│  - Ranking changes (gains/losses)               │
│  - Opportunity keywords (not yet ranking)       │
│                                                 │
│  ✍️  CONTENT PUBLISHED THIS MONTH                │
│  1. "SEO Best Practices 2024" (Jan 15)         │
│  2. "Content Strategy Guide" (Jan 22)          │
│  ... (only published content)                   │
│                                                 │
│  📅 CONTENT SCHEDULED                           │
│  - "Keyword Research Guide" (Feb 5)            │
│  - "Local SEO Tips" (Feb 12)                   │
│  ... (scheduled content)                        │
│                                                 │
│  💡 RECOMMENDATIONS FOR NEXT MONTH              │
│  - AI-driven content ideas                      │
│  - Keyword opportunities                        │
│  - Competitor gaps                              │
│  - Upsell opportunities                         │
│                                                 │
│  📋 WORK COMPLETED                              │
│  - Tasks completed this month                   │
│  - Monthly recurring tasks status               │
│                                                 │
│  🎯 NEXT MONTH PRIORITIES                       │
│  - Focus keywords                               │
│  - Planned content topics                       │
│  - Recommended actions                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **4. Report Generation Mechanism:**

**Option A: Automated (Recommended)**
```javascript
// Automated monthly report generation
// Runs on 1st of each month at 9 AM

1. Query database for:
   - Published content (date range: previous month)
   - Scheduled content (date range: previous month)
   - Approved content (selected by manager)
   - Rankings data (snapshot at end of month)
   - Traffic metrics (previous month)
   - Tasks completed (previous month)

2. Generate report sections:
   - Executive summary (AI-generated based on data)
   - Charts and graphs (from analytics data)
   - Content list (only selected content)
   - Recommendations (AI-powered)

3. Create PDF report
4. Send to client email (if configured)
5. Store in reports table for future access
```

**Option B: Manual Generation**
- Manager clicks "Generate Monthly Report"
- Select content to include (checkboxes)
- Choose date range
- Customize sections
- Generate PDF

**Option C: Hybrid (Best)**
- Automated report generated on 1st of month
- Manager can review/edit before sending
- Add/remove content items
- Add custom notes
- Regenerate and send

#### **5. Content Status Workflow:**

```
Content Generated
    ↓
Status: Draft
    ↓
Team Reviews → Status: In Review
    ↓
Approve → Status: Approved
    ↓
Schedule → Status: Scheduled
    ↓
Publish → Status: Published ✅ (Auto-included in report)
```

**Manager Control:**
- Can change content status
- Can mark content for "Report Inclusion" even if draft
- Can exclude published content from report (with reason)
- Can add custom notes to reports

#### **6. Report Delivery:**
- **Storage:** Reports stored in database (accessible anytime)
- **Email:** Automatic email to client (if email configured)
- **Download:** Client dashboard download link
- **History:** All previous reports accessible

#### **7. Database Schema for Reports:**

```sql
CREATE TABLE monthly_reports (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  report_month DATE, -- First day of month
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by INTEGER REFERENCES users(id),
  content_included JSONB, -- Array of content IDs included
  content_excluded JSONB, -- Array of content IDs excluded (with reasons)
  report_data JSONB, -- Full report data (for regeneration)
  pdf_path TEXT, -- Path to PDF file
  sent_to_client BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  client_notes TEXT, -- Optional notes from client
  status VARCHAR(50) DEFAULT 'draft' -- draft, final, sent
);
```

#### **8. Report Configuration Per Client:**
- **Auto-generate:** Yes/No
- **Auto-send:** Yes/No
- **Email recipients:** Multiple email addresses
- **Include draft content:** Yes/No (default: No)
- **Include rejected content:** Yes/No (default: No)
- **Custom sections:** Client-specific report sections

---

## 🔍 Investigation Needed

### **1. 500 Error on Project View:**
- Check backend logs: `/var/log/nginx/error.log` or backend console
- Verify API endpoint: `GET /api/projects/:id`
- Check database connection
- Check if project ID exists

### **2. Keyword Analysis - Why Only 3?**
- Check `enhancedEvidenceService.js` - how many keywords generated?
- Check `KeywordAnalysis.jsx` - how many displayed?
- Likely issue: Only showing `summary.top_priorities` (limited to 3)

---

## 📊 Implementation Priority

### **Phase 1: Critical Fixes** 🔴
1. ✅ Fix 500 error on Project View
2. ✅ Make Local SEO visible/accessible (all clients, project type option)
3. ✅ Expand keyword analysis output (50+ keywords with paid APIs)

### **Phase 2: Layout Redesign** 🟡
1. ✅ Implement collapsible left sidebar navigation
2. ✅ Redesign Clients Dashboard (SEMrush-style)
3. ✅ Add rank tracking and month-on-month graphs
4. ✅ Create Settings page with admin features
5. ✅ Implement export functionality

### **Phase 3: Enhanced Features** 🟢
1. ✅ Keyword selection interface for content generation
2. ✅ Programmatic SEO feature (max 50, Google Places API)
3. ✅ Full user authentication system (Admin/Manager/User roles)
4. ✅ Google OAuth integration (company account → client usage)
5. ✅ Task management (monthly + adhoc, team assignment)
6. ✅ Content ideas/gaps (AI + DataForSEO, upsell opportunities)

### **Phase 4: Reporting & Analytics** 🔵
1. ✅ Content status tracking system
2. ✅ Monthly report generation (automated + manual)
3. ✅ Report customization and delivery
4. ✅ Historical report storage and access

---

## ✅ Decisions Made

### **1. Layout:**
- ✅ **Collapsible sidebar** (can be hidden/shown)
- ✅ **Desktop-first** design priority

### **2. Clients Dashboard:**
- ✅ **Key Metrics:** Projects, Content Generated, Important Keywords, Content Ideas/Gaps
- ✅ **Content Ideas/Gaps:** AI + DataForSEO driven (regardless of services), opportunity to upsell
- ✅ **Tasks:** Monthly repetitive tasks + adhoc tasks, team member assignment capability
- ✅ **SEMrush-style:** Data-rich dashboard with graphs, rank tracking, month-on-month comparisons

### **3. Settings & Authentication:**
- ✅ **Full user authentication system** + API key management
- ✅ **User Roles:**
  - **Admin:** Controls everything
  - **Manager:** Client management, all activities, task assignment
  - **User:** Work on assigned tasks only
- ✅ **Google Authentication:** We take access under our company account first, then use for clients

### **4. Keyword Analysis:**
- ✅ **Minimum 50 keywords** per analysis
- ✅ **Include paid keyword research APIs** (DataForSEO + others) for best output

### **5. Programmatic SEO:**
- ✅ **Best Google API** for autocomplete (Google Places Autocomplete API)
- ✅ **Under Projects** section
- ✅ **Max batch size: 50** locations/services

### **6. Local SEO:**
- ✅ **Available for all clients**
- ✅ **Project type option** - clients can select "Local SEO" as project type
- ✅ Separate navigation/section as needed

---

## 🎯 Next Steps

**Please review and answer the questions above, then we'll:**
1. Fix the 500 error
2. Make Local SEO accessible
3. Expand keyword analysis
4. Implement layout redesign
5. Add new features

**Ready to proceed once you confirm the direction!** 🚀
