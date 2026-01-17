# User Acceptance Testing (UAT) Guide

**Application:** Tapverse Content Automation System  
**Version:** 2.0  
**Date:** January 2025  
**Test Environment:** app.tapverse.ai

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication & Access](#authentication--access)
3. [Navigation & Layout](#navigation--layout)
4. [Clients Dashboard](#clients-dashboard)
5. [Projects Management](#projects-management)
6. [Chat Functionality](#chat-functionality)
7. [Admin Features](#admin-features)
8. [Content Generation](#content-generation)
9. [Settings & Configuration](#settings--configuration)
10. [Known Issues & Limitations](#known-issues--limitations)

---

## Pre-Testing Setup

### Prerequisites
- ✅ Access to `app.tapverse.ai`
- ✅ Valid user account (Admin, Manager, or User role)
- ✅ Browser: Chrome/Firefox/Safari (latest version)
- ✅ JavaScript enabled
- ✅ Cookies enabled

### Test Data
- Create at least 2 test clients
- Create at least 1 project per client
- Ensure API keys are configured (Admin only)

---

## 1. Authentication & Access

### Test Case 1.1: Login
**Steps:**
1. Navigate to `app.tapverse.ai`
2. Click "Login" or go to `/login`
3. Enter valid email and password
4. Click "Login"

**Expected:**
- ✅ User is logged in
- ✅ Redirected to Home page or Clients Dashboard
- ✅ User name and role displayed in header
- ✅ Auth token stored in localStorage

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 1.2: Protected Routes
**Steps:**
1. Logout (or clear localStorage)
2. Try to access `/clients`, `/admin`, `/chat` directly

**Expected:**
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes without authentication

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 1.3: Role-Based Access
**Steps:**
1. Login as Admin
2. Verify "Admin Chat" and "Settings" are visible in navigation
3. Logout
4. Login as User (non-admin)
5. Verify "Admin Chat" is NOT visible

**Expected:**
- ✅ Admin: Can see all navigation items
- ✅ User: Cannot see "Admin Chat"
- ✅ User: Cannot access `/admin-chat` directly

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 2. Navigation & Layout

### Test Case 2.1: Main Navigation
**Steps:**
1. After login, check left sidebar navigation
2. Verify navigation items: Home, Clients, Chat, Settings
3. (Admin only) Verify "Admin Chat" is visible
4. Click each navigation item

**Expected:**
- ✅ Navigation shows: Home, Clients, Chat, Settings only
- ✅ Navigation does NOT show: Projects, Keywords, Analytics, Connections (removed)
- ✅ Clicking each item navigates correctly
- ✅ Active page highlighted in orange (#ff4f00)

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 2.2: Sidebar Collapse
**Steps:**
1. Click collapse button (←) in sidebar
2. Verify sidebar collapses to icon-only mode
3. Click expand button (→)
4. Verify sidebar expands

**Expected:**
- ✅ Sidebar collapses to ~64px width
- ✅ Only icons visible when collapsed
- ✅ Tooltips show on hover when collapsed
- ✅ Sidebar expands to full width when clicked

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 2.3: Theme Consistency
**Steps:**
1. Navigate through all pages: Home, Clients, Chat, Settings, Project Detail
2. Check color scheme and theme

**Expected:**
- ✅ All pages use light theme (white/gray backgrounds)
- ✅ Primary color: Orange (#ff4f00) throughout
- ✅ No dark theme (bg-gray-800, text-gray-400) visible
- ✅ Consistent Apple-inspired design

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 3. Clients Dashboard

### Test Case 3.1: All Clients View
**Steps:**
1. Navigate to `/clients`
2. Verify "All Clients" is selected in dropdown
3. Check metrics cards displayed

**Expected:**
- ✅ Dropdown shows "All Clients" by default
- ✅ Metrics cards show: Total Clients, Active Projects, Content Generated, Revenue
- ✅ Client list displayed below metrics
- ✅ Search bar and industry filter visible

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 3.2: Client Selection
**Steps:**
1. Select a client from dropdown
2. Verify dashboard changes to client-specific view

**Expected:**
- ✅ Client name displayed in header
- ✅ Metrics cards update: Active Projects, Content Generated, Keywords Tracked, Ranking Changes, Traffic Est.
- ✅ Sections shown: Projects, Tasks, Keywords, Content Ideas, Connections, Local SEO
- ✅ All sections use light theme

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 3.3: Create Client
**Steps:**
1. Click "+ Add Client" or "Create Client"
2. Fill in required fields: Tapverse Client ID, Company Name
3. Optional: Add business types, competitors, etc.
4. Submit form

**Expected:**
- ✅ Form displays correctly (light theme)
- ✅ Required fields validated
- ✅ Client created successfully
- ✅ Redirected to Clients dashboard
- ✅ New client appears in list

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 3.4: Edit Client
**Steps:**
1. Click "Edit" on a client card
2. Modify fields (e.g., company name)
3. Save changes

**Expected:**
- ✅ Form pre-populated with client data
- ✅ Changes saved successfully
- ✅ Client list updated

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 3.5: Content Ideas Generation
**Steps:**
1. Select a client from dropdown
2. Scroll to "Content Ideas & Gaps" section
3. Click "Generate Ideas" button
4. Wait for generation (may take 30-60 seconds)

**Expected:**
- ✅ Button shows "Generating..." while processing
- ✅ After completion, content ideas displayed:
  - Content Ideas (list)
  - Keyword Opportunities (list)
  - Upsell Opportunities (list)
- ✅ Error message shown if generation fails

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 3.6: Projects Section
**Steps:**
1. Select a client from dropdown
2. Scroll to "Projects" section
3. Click "View All" or "+ New"
4. Verify navigation

**Expected:**
- ✅ Projects section shows project count
- ✅ Recent projects listed (up to 5)
- ✅ "View All" links to `/clients/:clientId/projects`
- ✅ "+ New" links to project creation

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 4. Projects Management

### Test Case 4.1: Create Project from Clients Dashboard
**Steps:**
1. Select a client
2. Click "+ New" in Projects section
3. Fill in project form
4. Submit

**Expected:**
- ✅ Form opens (light theme)
- ✅ Client pre-selected
- ✅ Competitors auto-populated from client
- ✅ Project created successfully
- ✅ Navigation stays in Clients context OR redirects to Project Detail (light theme)

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 4.2: View Project Detail
**Steps:**
1. Click on a project from Clients dashboard
2. OR Navigate to `/projects/:projectId` directly

**Expected:**
- ✅ Project Detail page loads (light theme)
- ✅ Project header shows: Project name, Client name, Status badge
- ✅ Project details grid shows: Content Types, Keywords, Content Style, Target Audience
- ✅ Tabs displayed: Strategy Dashboard, SEO Strategy, etc.
- ✅ All tabs use light theme

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 4.3: Project Tabs Navigation
**Steps:**
1. Open Project Detail page
2. Click through different tabs:
   - Strategy Dashboard
   - SEO Strategy
   - Google Ads
   - Facebook Ads
   - Article Ideas
   - Local SEO
   - Programmatic SEO
   - Chat

**Expected:**
- ✅ Each tab loads correctly
- ✅ Active tab highlighted in orange
- ✅ Content displays in light theme
- ✅ No blank screens or errors

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 5. Chat Functionality

### Test Case 5.1: General Chat
**Steps:**
1. Navigate to `/chat` or click "Chat" in navigation
2. Verify chat interface loads
3. Click "+ New" to create conversation
4. Send a test message
5. Wait for AI response

**Expected:**
- ✅ Chat interface displays (light theme)
- ✅ Conversations sidebar shows on left
- ✅ New conversation created successfully
- ✅ User message appears immediately
- ✅ AI response appears after processing (may take 10-30 seconds)
- ✅ Errors displayed in red box if any

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 5.2: Chat Error Handling
**Steps:**
1. Go to Chat page
2. If there's an error (e.g., authentication, API), verify error display
3. Try to send message with invalid data

**Expected:**
- ✅ Error messages displayed in red box at top of sidebar
- ✅ Error message is clear and actionable
- ✅ Chat doesn't show blank screen on error
- ✅ User can retry after error

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 5.3: Admin Chat (Admin Only)
**Steps:**
1. Login as Admin
2. Navigate to `/admin-chat`
3. Verify admin chat interface
4. Send a message about clients/portfolio

**Expected:**
- ✅ Admin Chat accessible only to admins
- ✅ Insights section visible at top of sidebar
- ✅ Can query about clients, keywords, portfolio metrics
- ✅ Error messages displayed if any

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 5.4: Client Chat
**Steps:**
1. Open Project Detail page
2. Click "Chat" tab
3. Start a conversation about the client

**Expected:**
- ✅ Client chat interface loads
- ✅ Chat has context about the specific client
- ✅ Messages send successfully
- ✅ AI responses consider client context

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 6. Admin Features

### Test Case 6.1: Settings Page - API Keys Tab
**Steps:**
1. Navigate to `/admin` or "Settings"
2. Click "API Keys" tab
3. Verify API key fields displayed
4. (Optional) Update an API key
5. Click "Save All Changes"

**Expected:**
- ✅ API Keys tab shows all API key inputs
- ✅ Keys masked/encrypted (showing as dots or hidden)
- ✅ Changes saved successfully
- ✅ Confirmation message displayed

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 6.2: Settings Page - User Management Tab
**Steps:**
1. Go to Settings
2. Click "User Management" tab
3. Verify user list displayed
4. (Optional) Create/edit/delete user

**Expected:**
- ✅ User list displayed in table/cards
- ✅ User roles shown (Admin, Manager, User)
- ✅ Actions: Create, Edit, Delete available
- ✅ Changes saved successfully

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 6.3: Settings Page - General Tab
**Steps:**
1. Go to Settings
2. Click "General" tab
3. Verify settings displayed:
   - Application Name
   - Default Timezone
   - Default Language
   - Email Configuration
   - Notification Settings

**Expected:**
- ✅ General tab displays all settings
- ✅ Settings editable
- ✅ All inputs use light theme
- ✅ Changes saved successfully

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 6.4: Settings Page - Integrations Tab
**Steps:**
1. Go to Settings
2. Click "Integrations" tab
3. Verify integration options:
   - Google Services (Analytics, Search Console, My Business)
   - Social Media (LinkedIn, Twitter, Facebook)
   - E-commerce (Shopify)

**Expected:**
- ✅ Integrations tab displays all options
- ✅ Each integration has "Connect" button
- ✅ Light theme applied throughout

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 7. Content Generation

### Test Case 7.1: Keyword Analysis
**Steps:**
1. Open Project Detail
2. Navigate to Keyword Analysis (if available)
3. Run keyword analysis

**Expected:**
- ✅ Keyword analysis runs successfully
- ✅ Results displayed with:
  - Opportunities
  - Competitor gaps
  - Trends
  - Strength ratings
- ✅ Minimum 50 keywords shown (not just 3)

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 7.2: Content Generation from Project
**Steps:**
1. Open Project Detail
2. Click "Direct Generate" or "Content Generator" tab
3. Select content type (e.g., Blog)
4. Generate content

**Expected:**
- ✅ Content generation starts
- ✅ Progress indicator shown
- ✅ Generated content displayed
- ✅ Content includes evidence/reasoning (if available)

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 8. Settings & Configuration

### Test Case 8.1: API Key Management
**Steps:**
1. Go to Settings > API Keys
2. Update Claude API key
3. Save changes
4. Verify API key is used in content generation

**Expected:**
- ✅ API key updated successfully
- ✅ New API key used for subsequent requests
- ✅ Error if invalid API key provided

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 9. Error Handling & Edge Cases

### Test Case 9.1: Network Errors
**Steps:**
1. Disconnect internet (or block network in DevTools)
2. Try to load clients, send chat message, etc.

**Expected:**
- ✅ Error messages displayed clearly
- ✅ No blank screens or crashes
- ✅ User can retry when network restored

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

### Test Case 9.2: Empty States
**Steps:**
1. Create a new client with no projects
2. Verify empty states display correctly
3. Check all sections show appropriate "No data" messages

**Expected:**
- ✅ Empty states show friendly messages
- ✅ "Create" or "Add" buttons visible
- ✅ No broken UI or errors

**Actual Result:** _______________  
**Pass/Fail:** _______________

---

## 10. Known Issues & Limitations

### Current Limitations
1. **Logo & Favicon:** User must add `logo.png` and `favicon.png` to `frontend/public/` manually
2. **Graphs/Charts:** Month-on-month graphs in Clients Dashboard are placeholders (sections ready, needs chart library)
3. **Full Task Management:** Tasks section in Clients Dashboard is placeholder (backend ready, UI pending)
4. **Content Ideas Storage:** Content ideas are displayed immediately but not stored in database yet

### Known Bugs (Fixed)
- ✅ Chat error handling - Fixed
- ✅ ProjectDetail dark theme - Fixed (all converted to light)
- ✅ Content ideas display - Fixed

---

## Test Summary

### Test Execution
**Tester Name:** _______________  
**Test Date:** _______________  
**Test Duration:** _______________  
**Environment:** app.tapverse.ai

### Results Summary
- **Total Test Cases:** 30+
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___
- **Not Tested:** ___

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Minor Issues Found
1. _______________
2. _______________
3. _______________

### Recommendations
_______________

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Approved/Rejected:** _______________

**Reviewed By (Product Owner):** _______________  
**Date:** _______________  
**Approved/Rejected:** _______________

---

**Note:** This is a comprehensive UAT guide. Test each section thoroughly and document all findings. For questions or issues, refer to the development team or documentation.
