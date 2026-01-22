# Functional Audit Plan - Feature Testing & Verification

## 🎯 Purpose
Test EVERY feature to verify:
1. **Functionality** - Does it work as designed?
2. **Placement** - Is it accessible from the correct location?
3. **API Integration** - Do API endpoints work correctly?
4. **Data Flow** - Does data flow correctly from backend to frontend?
5. **User Experience** - Is it accessible from the right navigation points?

---

## 📋 Audit Methodology

### Phase 1: Backend API Testing
**Goal:** Verify all API endpoints respond correctly

#### Test Categories:

**A. Client Management APIs**
- [ ] `GET /api/clients` - Get all clients
- [ ] `POST /api/clients` - Create client
- [ ] `GET /api/clients/:id` - Get client by ID
- [ ] `PUT /api/clients/:id` - Update client
- [ ] `DELETE /api/clients/:id` - Delete client
- **Test:** Create a client, verify data saves, retrieve it, update it, delete it

**B. Project Management APIs**
- [ ] `GET /api/projects` - Get all projects
- [ ] `POST /api/projects` - Create project
- [ ] `GET /api/projects/:id` - Get project by ID
- [ ] `PUT /api/projects/:id` - Update project
- [ ] `DELETE /api/projects/:id` - Delete project
- **Test:** Create a project for a client, verify data saves, retrieve it

**C. Keyword Analysis APIs**
- [ ] `POST /api/keyword-analysis/analyze` - Generate keyword analysis
- **Test:** Submit analysis request, verify it returns 50+ keywords
- **Test:** Verify keywords are categorized correctly
- **Test:** Verify competitor analysis included
- **Test:** Verify trend analysis included

**D. Content Generation APIs**
- [ ] `POST /api/content/generate` - Generate content
- [ ] `GET /api/content/project/:projectId` - Get project content
- **Test:** Generate content for a project, verify it saves

**E. Chat APIs**
- [ ] `POST /api/chat/conversations` - Create conversation
- [ ] `GET /api/chat/conversations` - Get conversations
- [ ] `GET /api/chat/conversations/:id` - Get conversation by ID
- [ ] `POST /api/chat/conversations/:id/messages` - Send message
- [ ] `GET /api/chat/conversations/:id/messages` - Get messages
- **Test:** Create conversation, send message, verify response, retrieve messages

**F. Admin Chat APIs**
- [ ] `POST /api/admin-chat/conversations/:id/messages` - Send admin message
- [ ] `GET /api/admin-chat/insights` - Get insights
- **Test:** Send admin message, verify tool calling works
- **Test:** Verify insights are generated

**G. Authentication APIs**
- [ ] `POST /api/auth/register` - Register user
- [ ] `POST /api/auth/login` - Login
- [ ] `GET /api/auth/me` - Get current user
- [ ] `GET /api/auth/users` - Get all users (admin)
- [ ] `PUT /api/auth/users/:id` - Update user
- [ ] `DELETE /api/auth/users/:id` - Delete user (admin)
- **Test:** Register user, login, verify JWT token, test protected routes

**H. Settings/Admin APIs**
- [ ] `GET /api/settings` - Get all settings
- [ ] `PUT /api/settings/:key` - Update setting
- [ ] `POST /api/settings/test/:key` - Test API key
- **Test:** Get settings, update API key, test connection

**I. Task Management APIs**
- [ ] `POST /api/tasks` - Create task
- [ ] `GET /api/tasks` - Get tasks
- [ ] `GET /api/tasks/client/:clientId` - Get client tasks
- [ ] `PUT /api/tasks/:id` - Update task
- [ ] `DELETE /api/tasks/:id` - Delete task
- **Test:** Create monthly recurring task, assign to user, verify it appears

**J. Rank Tracking APIs**
- [ ] `POST /api/rank-tracking/record` - Record ranking
- [ ] `GET /api/rank-tracking/client/:clientId` - Get rankings
- [ ] `GET /api/rank-tracking/client/:clientId/trends` - Get trends
- **Test:** Record keyword ranking, retrieve trends, verify month-on-month data

**K. Content Status APIs**
- [ ] `PUT /api/content/:id/status` - Update content status
- [ ] `GET /api/content/:id/status-history` - Get status history
- **Test:** Update content status, verify history is tracked

**L. Export APIs**
- [ ] `GET /api/export/keywords` - Export keywords
- [ ] `GET /api/export/content` - Export content
- [ ] `GET /api/export/tasks` - Export tasks
- **Test:** Export data in CSV/JSON format, verify file downloads

**M. Reports APIs**
- [ ] `POST /api/reports/monthly/generate` - Generate monthly report
- [ ] `GET /api/reports/monthly/client/:clientId` - Get client reports
- **Test:** Generate monthly report, verify it includes correct data

**N. Content Ideas APIs**
- [ ] `POST /api/content-ideas/generate` - Generate content ideas
- [ ] `GET /api/content-ideas/gaps/:clientId` - Get content gaps
- **Test:** Generate content ideas, verify upsell opportunities identified

**O. Programmatic SEO APIs**
- [ ] `POST /api/programmatic-seo/generate` - Generate programmatic content
- [ ] `GET /api/programmatic-seo/project/:projectId` - Get programmatic content
- **Test:** Generate Service+Location content, verify it saves

**P. Local SEO APIs**
- [ ] `POST /api/local-seo/analyze` - Analyze local SEO
- **Test:** Run local SEO analysis, verify it works for all clients

---

### Phase 2: Frontend Feature Testing
**Goal:** Verify features work in the UI and are accessible from correct locations

#### Test Categories:

**A. Client Management**
- [ ] Navigate to `/clients` - Does it load?
- [ ] Click "Create Client" - Does form appear?
- [ ] Fill form and submit - Does client get created?
- [ ] Verify client appears in list
- [ ] Click "Edit" on a client - Does edit form load with data?
- [ ] Update client - Does it save?
- [ ] Click "Delete" - Does it delete?
- [ ] **Placement Check:** Is Clients accessible from main nav? (Should be YES)

**B. Project Management**
- [ ] Navigate to `/clients/:id/projects` - Does it load?
- [ ] Click "Create Project" - Does form appear?
- [ ] Fill form and submit - Does project get created?
- [ ] Verify project appears in list
- [ ] Click "View" on project - Does Project Detail load?
- [ ] **Placement Check:** Is Projects accessible from main nav? (Should be NO - only from Clients)

**C. Keyword Analysis**
- [ ] Navigate to keyword analysis - How do you get there?
- [ ] Run keyword analysis - Does it generate results?
- [ ] Verify it shows 50+ keywords (not just 3)
- [ ] Verify categories are present (Primary, Secondary, Long-tail, etc.)
- [ ] **Placement Check:** Where is Keyword Analysis accessible from?
  - [ ] From Project Detail? (Should be YES)
  - [ ] From main nav? (Should be NO)
  - [ ] From Clients dashboard? (Should be YES)

**D. Content Generation**
- [ ] Navigate to Project Detail
- [ ] Select content type (Blog, LinkedIn, etc.)
- [ ] Click "Generate" - Does it generate content?
- [ ] Verify content appears and can be edited
- [ ] **Placement Check:** Is Content Generation accessible from Project Detail? (Should be YES)

**E. Chat (General)**
- [ ] Navigate to `/chat` - Does it load?
- [ ] Click "New Conversation" - Does conversation create?
- [ ] Send a message - Does AI respond?
- [ ] Verify conversation saves
- [ ] **Placement Check:** Is Chat accessible from main nav? (Should be YES)

**F. Client Chat**
- [ ] Navigate to Project Detail
- [ ] Click "Chat" tab - Does it load?
- [ ] Send a message - Does it include client context?
- [ ] Verify conversation is client-specific
- [ ] **Placement Check:** Is Client Chat accessible from Project Detail? (Should be YES)

**G. Admin Chat**
- [ ] Login as admin
- [ ] Navigate to `/admin-chat` - Does it load?
- [ ] Send a message asking for client data - Does it retrieve data?
- [ ] Verify tool calling works
- [ ] **Placement Check:** Is Admin Chat visible only to admins? (Should be YES)

**H. Settings/Admin Setup**
- [ ] Navigate to `/admin` - Does it load?
- [ ] Click "API Keys" tab - Does it show all API keys?
- [ ] Edit an API key - Does it save?
- [ ] Test an API key - Does test work?
- [ ] Click "User Management" tab - Does it show users?
- [ ] Create a new user - Does it work?
- [ ] Edit a user - Does it work?
- [ ] Delete a user - Does it work?
- [ ] **Placement Check:** Is Settings accessible from main nav? (Should be YES)
- [ ] **Missing Tabs Check:** Are "General" and "Integrations" tabs present? (Should be YES)

**I. Tasks**
- [ ] Navigate to Clients dashboard - Where is Tasks section?
- [ ] Create a monthly recurring task - Does it work?
- [ ] Assign task to user - Does it work?
- [ ] Verify task appears in assigned user's view
- [ ] **Placement Check:** Where is Task Management accessible from?
  - [ ] From Clients dashboard? (Should be YES)
  - [ ] From main nav? (Should be NO)

**J. Rank Tracking**
- [ ] Navigate to Clients dashboard - Where is Rank Tracking section?
- [ ] View keyword rankings - Are they displayed?
- [ ] View month-on-month graphs - Do they appear?
- [ ] **Placement Check:** Where is Rank Tracking accessible from?
  - [ ] From Clients dashboard? (Should be YES)
  - [ ] From main nav? (Should be NO)

**K. Content Ideas/Gaps**
- [ ] Navigate to Clients dashboard - Where is Content Ideas section?
- [ ] Generate content ideas - Do they appear?
- [ ] Verify upsell opportunities are shown
- [ ] **Placement Check:** Where is Content Ideas accessible from?
  - [ ] From Clients dashboard? (Should be YES)
  - [ ] From main nav? (Should be NO)

**L. Programmatic SEO**
- [ ] Navigate to Project Detail
- [ ] Click "Programmatic SEO" tab - Does it load?
- [ ] Add services and locations - Does it work?
- [ ] Generate content - Does it work?
- [ ] **Placement Check:** Is Programmatic SEO accessible from Project Detail? (Should be YES)

**M. Local SEO**
- [ ] Navigate to Project Detail
- [ ] Click "Local SEO" tab - Does it load?
- [ ] Run analysis - Does it work?
- [ ] **Placement Check:** Is Local SEO accessible from Project Detail? (Should be YES)
- [ ] **Verification:** Is it available for ALL clients? (Should be YES)

**N. Export**
- [ ] Navigate to Clients dashboard
- [ ] Find Export button - Where is it?
- [ ] Click Export for keywords - Does it download?
- [ ] Click Export for content - Does it download?
- [ ] **Placement Check:** Are Export buttons present on data tables? (Should be YES)

**O. Monthly Reports**
- [ ] Navigate to Clients dashboard - Where is Reports section?
- [ ] Generate monthly report - Does it work?
- [ ] Verify report includes correct data
- [ ] **Placement Check:** Where is Report Generation accessible from?
  - [ ] From Clients dashboard? (Should be YES)

**P. Analytics**
- [ ] Navigate to `/analytics` - Does it load?
- [ ] Select a client - Does analytics load?
- [ ] **Placement Check:** Is Analytics accessible from main nav? (Should be NO - should be in Clients dashboard)

---

### Phase 3: Feature Placement Verification
**Goal:** Verify features are accessible from correct navigation points per spec

#### Navigation Structure Check (per PRODUCT_REDESIGN_PLAN.md):

**Main Navigation (Left Sidebar) - Should ONLY have:**
- [ ] ✅ Home
- [ ] ✅ Clients
- [ ] ✅ Settings (Admin only visible to admins)
- [ ] ✅ Chat (optional/general)
- [ ] ✅ Admin Chat (admin only)
- [ ] ❌ NO Projects
- [ ] ❌ NO Keywords
- [ ] ❌ NO Analytics
- [ ] ❌ NO Connections

**Features Accessible FROM Clients Dashboard:**
- [ ] Projects section (expandable/clickable)
- [ ] Tasks section
- [ ] Connections section
- [ ] Keywords section (with rank tracking)
- [ ] Local SEO section
- [ ] Overall Strategy section
- [ ] Content Schedule section
- [ ] Export options
- [ ] Report generation

**Features Accessible FROM Project Detail:**
- [ ] Keyword Analysis tab
- [ ] Content Generation tab
- [ ] Programmatic SEO tab
- [ ] Local SEO tab
- [ ] Client Chat tab

**Features NOT in Main Nav (but accessible elsewhere):**
- [ ] Projects - Only from Clients dashboard
- [ ] Keywords - Only from Clients dashboard or Project Detail
- [ ] Analytics - Only from Clients dashboard
- [ ] Connections - Only from Clients dashboard or Settings

---

### Phase 4: Data Flow Testing
**Goal:** Verify data flows correctly from backend to frontend

#### Test Scenarios:

**A. Client Creation Flow**
1. Create client via UI
2. Verify API call is made to `POST /api/clients`
3. Verify response is received
4. Verify client appears in list
5. Verify client data is correct

**B. Project Creation Flow**
1. Create project via UI
2. Verify API call is made to `POST /api/projects`
3. Verify client_id is included
4. Verify project appears in client's projects list
5. Verify project data is correct

**C. Keyword Analysis Flow**
1. Run keyword analysis via UI
2. Verify API call is made to `POST /api/keyword-analysis/analyze`
3. Verify response contains 50+ keywords
4. Verify keywords are displayed correctly
5. Verify categories are shown

**D. Content Generation Flow**
1. Generate content via UI
2. Verify API call is made to `POST /api/content/generate`
3. Verify response contains content
4. Verify content is saved to database
5. Verify content appears in project

**E. Chat Message Flow**
1. Send chat message via UI
2. Verify API call is made to `POST /api/chat/conversations/:id/messages`
3. Verify response contains AI message
4. Verify message is saved to database
5. Verify message appears in chat UI

---

### Phase 5: Error Handling Testing
**Goal:** Verify error handling works correctly

#### Test Scenarios:

**A. API Errors**
- [ ] Invalid API key - Does error message appear?
- [ ] Network error - Does error message appear?
- [ ] Server error (500) - Does error message appear?
- [ ] Validation error - Does error message appear?

**B. Authentication Errors**
- [ ] Access protected route without login - Does redirect to login?
- [ ] Access admin route as non-admin - Does error appear?
- [ ] Expired token - Does redirect to login?

**C. Data Validation Errors**
- [ ] Submit empty form - Does validation error appear?
- [ ] Submit invalid email - Does validation error appear?
- [ ] Submit invalid data - Does validation error appear?

---

## 📊 Testing Execution Plan

### Step 1: Backend API Testing (Manual)
1. Start backend server
2. Test each API endpoint using curl or Postman
3. Document results

### Step 2: Frontend Feature Testing (Manual)
1. Start frontend server
2. Test each feature in browser
3. Document results

### Step 3: Automated Testing (If possible)
1. Write integration tests for critical flows
2. Run tests automatically
3. Document results

### Step 4: Documentation
1. Create functional audit report
2. List all passing tests
3. List all failing tests
4. List all missing features
5. List all placement issues

---

## 📝 Expected Results Document

### For Each Feature:
```
Feature: [Name]
API Endpoint: [URL]
Navigation Path: [How to access]

Functionality Test:
- [ ] API responds correctly
- [ ] Feature works in UI
- [ ] Data saves correctly
- [ ] Data displays correctly

Placement Test:
- [ ] Accessible from correct location
- [ ] NOT accessible from wrong location
- [ ] Matches spec

Data Flow Test:
- [ ] Frontend → Backend: Working
- [ ] Backend → Database: Working
- [ ] Database → Backend: Working
- [ ] Backend → Frontend: Working

Status: [PASS / FAIL / MISSING]
Issues: [List any issues found]
```

---

## 🎯 Who Will Audit This?

### Option A: Automated Testing (Recommended)
- Create test scripts to test APIs
- Create integration tests for frontend features
- Run tests automatically

### Option B: Manual Testing (Current)
- Test each feature manually in browser
- Test each API endpoint manually
- Document results

### Option C: Hybrid Approach (Best)
- Automated tests for APIs
- Manual testing for UI features
- Document both results

---

## ✅ Next Steps

1. **Start Backend API Testing** - Test all endpoints
2. **Start Frontend Feature Testing** - Test all features in UI
3. **Document Results** - Create comprehensive report
4. **Fix Issues** - Address all failures
5. **Re-test** - Verify fixes work

---

**Status:** Ready to begin testing
