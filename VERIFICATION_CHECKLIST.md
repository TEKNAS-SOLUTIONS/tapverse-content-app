# Deployment Verification Checklist
## Check app.tapverse.ai Against Plan

## ✅ Navigation Structure (Left Sidebar)

**Expected:**
- [ ] Logo at top corner of sidebar
- [ ] Left sidebar menu (not top navigation)
- [ ] Menu items: Home, Clients, Settings
- [ ] NO top-level "Projects" in navigation
- [ ] Clean, modern SaaS UI

**If you see:** Top navigation bar with many items → ❌ Not correct

---

## ✅ Dashboard/Home Page

**Expected:**
- [ ] Dashboard as the home page (not old Home page)
- [ ] Stats cards showing: Total Clients, Total Projects, Active Projects
- [ ] Quick actions section (View Clients, Create New Client)
- [ ] Recent clients section (card-based)
- [ ] Activity feed or metrics

**If you see:** Old home page with features list → ❌ Not correct

---

## ✅ Clients Page

**Expected:**
- [ ] Card-based client list (not table/list)
- [ ] Each client as a rectangular card
- [ ] "View Details" button on each card
- [ ] Clicking a client shows client detail page
- [ ] Client detail shows projects as cards below
- [ ] Projects are NESTED under clients (not separate page)

**If you see:** 
- Clients in a table/list → ❌ Not correct
- Projects in top navigation → ❌ Not correct
- Projects not visible under clients → ❌ Not correct

---

## ✅ Project Detail Page

**Expected:**
- [ ] Project header with name and status
- [ ] Content Type Cards at the TOP (horizontal layout)
- [ ] Only shows: "SEO Blog Content" and "Programmatic SEO" cards
- [ ] Cards are clickable buttons
- [ ] NO tabs (no dashboard, seo-strategy, google-ads, etc.)
- [ ] Clean, simple layout

**If you see:**
- Multiple tabs at top → ❌ Not correct (old design)
- Content types not as cards → ❌ Not correct
- Too many options visible → ❌ Not correct

---

## ✅ SEO Blog Workflow

**Click "SEO Blog Content" card, should see:**

**Step 1: Keyword Analysis**
- [ ] Button to "Start Keyword Analysis"
- [ ] Shows analysis results when complete
- [ ] "Continue to Keyword Gaps" button

**Step 2: Keyword Gaps Analysis**
- [ ] Button to "Analyze Keyword Gaps"
- [ ] Shows gap analysis results
- [ ] "Continue to Keyword Selection" button

**Step 3: Keyword Selection**
- [ ] Shows 5-10 keywords with ratings/scores
- [ ] Checkboxes to select multiple keywords
- [ ] Shows metrics: Volume, Difficulty, Opportunity
- [ ] "Generate Content Ideas" button

**Step 4: Content Ideas**
- [ ] Shows 3-5 content ideas as cards
- [ ] "Rerun Ideas" button to generate new ones
- [ ] Click idea to select it

**Step 5: Generate Content**
- [ ] Shows selected idea
- [ ] "Generate Content" button
- [ ] Progress indicator during generation

**Step 6: Content Display**
- [ ] Content appears at bottom (collapsible)
- [ ] SEO Meta Details section (title, meta title, meta description, focus keyword)
- [ ] Export buttons: "Export to Word" and "Copy to Clipboard"
- [ ] Approval workflow with checkbox
- [ ] "Approve Selected" button

**If you see:** Old content generator with direct input → ❌ Not correct

---

## ✅ Programmatic SEO Workflow

**Click "Programmatic SEO" card, should see:**

**Step 1: Select Suburbs**
- [ ] Google Places API autocomplete search box
- [ ] Can search and select suburbs
- [ ] Selected suburbs shown as list
- [ ] "Continue to Services" button

**Step 2: Manage Services**
- [ ] Input field to add services
- [ ] List of services with remove option
- [ ] "Continue to Combinations" button

**Step 3: Select Combinations**
- [ ] Grid/matrix showing Suburb × Service combinations
- [ ] Checkboxes for each combination
- [ ] Shows count of selected combinations
- [ ] "Generate X Content Pieces" button (up to 10)

**Step 4: Batch Generate**
- [ ] Progress for each piece being generated
- [ ] Shows "Generating..." for each
- [ ] Progress bar showing completion

**Step 5: Content Display**
- [ ] All content in collapsible sections
- [ ] Each piece shows: Title, Content, SEO Meta Details
- [ ] Export buttons per content
- [ ] Bulk export as ZIP option
- [ ] Approval workflow with checkboxes

**If you see:** No Google Places autocomplete → ❌ Not correct

---

## ✅ Common Features

**For Both SEO Types:**
- [ ] Collapsible content sections (expand/collapse)
- [ ] SEO Meta Details visible and editable
- [ ] Export to Word document works
- [ ] Copy to clipboard works
- [ ] Approval workflow with checkboxes
- [ ] Toast notifications for actions

---

## ✅ Error Handling & Feedback

**Expected:**
- [ ] No full-page crashes (error boundaries)
- [ ] User-friendly error messages
- [ ] Loading states (skeleton screens or spinners)
- [ ] Toast notifications for success/errors
- [ ] Progress indicators for long operations

---

## ❌ What Should NOT Be Visible

- [ ] Top navigation bar with many items
- [ ] "Projects" in main navigation
- [ ] Multiple tabs in project detail
- [ ] Old content generator interface
- [ ] Confusing navigation structure

---

## Quick Test Flow

1. **Home** → Should show Dashboard
2. **Clients** → Should show card list
3. **Click Client** → Should show projects as cards
4. **Click Project** → Should show content type cards at top
5. **Click "SEO Blog"** → Should show 6-step workflow
6. **Click "Programmatic SEO"** → Should show 5-step workflow with Google Places

---

## If Something Doesn't Match

**Common Issues:**

1. **Old UI still showing:**
   - Frontend not rebuilt: `cd frontend && npm run build`
   - Browser cache: Clear cache or hard refresh (Ctrl+Shift+R)

2. **Navigation wrong:**
   - Check if Layout.jsx is using new Sidebar component
   - Verify App.jsx routes are correct

3. **Projects not nested:**
   - Check Clients page shows projects
   - Verify routing: `/clients/:clientId` shows projects

4. **Content type cards missing:**
   - Check ProjectDetail.jsx uses ContentTypeCards component
   - Verify only active types shown

5. **Workflows not working:**
   - Check browser console for errors (F12)
   - Verify API endpoints are accessible
   - Check backend logs

---

## Report Back

Please check each item and let me know:
- ✅ What's working correctly
- ❌ What doesn't match the plan
- 🔧 What needs to be fixed

This will help me identify what needs adjustment!
