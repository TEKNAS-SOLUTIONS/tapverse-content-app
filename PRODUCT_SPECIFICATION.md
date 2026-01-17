# Tapverse Content Automation System - Product Specification

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Production Ready

---

## Executive Summary

The Tapverse Content Automation System is an internal content generation platform that automates SEO content, social media content, ads, and AI avatar videos for Tapverse clients. The system features a SEMrush-style dashboard, AI-powered content generation, and comprehensive client management.

---

## 1. Core Features

### 1.1 Authentication & Authorization
- ✅ User authentication (Login/Register)
- ✅ Role-based access control (Admin, Manager, User)
- ✅ JWT token management
- ✅ Protected routes
- ✅ Google OAuth (planned)

### 1.2 Navigation & Layout
- ✅ Collapsible left sidebar
- ✅ Main navigation: Home, Clients, Chat, Admin Chat (admin only), Settings
- ✅ Apple-inspired light theme
- ✅ Primary color: Orange (#ff4f00)
- ✅ Responsive design (desktop-first)

### 1.3 Clients Dashboard
- ✅ All clients view with metrics
- ✅ Client-specific dashboard (SEMrush-style)
- ✅ Metrics: Total Clients, Active Projects, Content Generated, Revenue
- ✅ Client-specific metrics: Projects, Content, Keywords, Rankings, Traffic
- ✅ Sections: Projects, Tasks, Keywords, Content Ideas, Connections, Local SEO

### 1.4 Projects Management
- ✅ Create/Edit/Delete projects
- ✅ Project types: SEO, Local SEO, Social Media, Google Ads, Facebook Ads, AI Content, AI Video, Email Marketing
- ✅ Project Detail page with tabs
- ✅ Light theme throughout

### 1.5 Chat Functionality
- ✅ General Chat (`/chat`)
- ✅ Admin Chat (`/admin-chat`) - Admin only, tool calling, portfolio insights
- ✅ Client Chat (in Project Detail) - Client-specific context
- ✅ Conversation threads
- ✅ Error handling and display

### 1.6 Content Generation
- ✅ SEO content (blog posts, articles)
- ✅ Social media content (LinkedIn, Twitter, Instagram, TikTok)
- ✅ Google Ads copy
- ✅ Facebook/Instagram Ads copy
- ✅ Email newsletters
- ✅ Keyword analysis (50+ keywords)
- ✅ Content evidence with reasoning

### 1.7 Keyword Analysis
- ✅ Competitor analysis
- ✅ Industry analysis
- ✅ Trend analysis
- ✅ SERP analysis
- ✅ Keyword strength ratings
- ✅ AI-driven keyword recommendations

### 1.8 Local SEO
- ✅ Available for all clients
- ✅ Google Places integration
- ✅ Local keyword analysis
- ✅ Location-based content

### 1.9 Programmatic SEO
- ✅ Service + Location content generation
- ✅ Google Places autocomplete
- ✅ Bulk location entry

### 1.10 Content Ideas & Gaps
- ✅ AI-driven content ideas
- ✅ Keyword opportunities
- ✅ Upsell opportunities
- ✅ Competitor content gaps

### 1.11 Settings & Configuration
- ✅ API Keys management (Claude, HeyGen, ElevenLabs, etc.)
- ✅ User management (Admin, Manager, User roles)
- ✅ General settings (App Name, Timezone, Language, Email, Notifications)
- ✅ Integrations (Google, Social Media, E-commerce)

### 1.12 Task Management
- ✅ Monthly recurring tasks
- ✅ Ad-hoc tasks
- ✅ Team assignment
- ✅ Task status tracking

### 1.13 Export & Reporting
- ✅ Export keywords (CSV)
- ✅ Export content (PDF)
- ✅ Export reports (JSON)
- ✅ Monthly client reports

### 1.14 Rank Tracking
- ✅ Keyword rank tracking
- ✅ Historical data
- ✅ Month-on-month comparisons

---

## 2. Technical Specifications

### 2.1 Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Axios
- **Markdown:** React Markdown
- **Theme:** Light theme (Apple-inspired)
- **Primary Color:** Orange (#ff4f00)

### 2.2 Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **API:** RESTful APIs

### 2.3 Database
- **RDBMS:** PostgreSQL
- **UUIDs:** For all primary keys
- **JSONB:** For flexible data storage
- **Migrations:** SQL migration files
- **Indexes:** Optimized for performance

### 2.4 API Integrations
- **Claude API:** Content generation, chat
- **DataForSEO:** Keyword analysis, rank tracking
- **Google Places API:** Location autocomplete
- **HeyGen API:** AI avatar videos (planned)
- **ElevenLabs API:** Voiceover generation (planned)
- **OpenAI API:** Image generation (planned)
- **Social Media APIs:** LinkedIn, Twitter, Instagram, TikTok (planned)

### 2.5 Infrastructure
- **Server:** Ubuntu 20.04+
- **Web Server:** Nginx
- **Process Manager:** Screen sessions
- **SSL:** Let's Encrypt (HTTPS)
- **Domain:** app.tapverse.ai

---

## 3. User Roles & Permissions

### 3.1 Admin
- ✅ Full system access
- ✅ API key management
- ✅ User management (create, edit, delete users)
- ✅ Admin Chat (portfolio-wide queries)
- ✅ All client data access

### 3.2 Manager
- ✅ Client management
- ✅ Project management
- ✅ Task assignment
- ✅ Content generation
- ❌ No API key management
- ❌ No user management

### 3.3 User
- ✅ Task execution
- ✅ Content generation (assigned projects)
- ✅ General Chat
- ✅ Client Chat (assigned clients)
- ❌ No client/project creation
- ❌ No settings access

---

## 4. Design System

### 4.1 Color Palette
- **Primary Orange:** #ff4f00
- **Background:** White (#ffffff)
- **Surface:** Gray-50 (#f9fafb)
- **Text Primary:** Gray-900 (#111827)
- **Text Secondary:** Gray-600 (#4b5563)
- **Text Tertiary:** Gray-500 (#6b7280)
- **Border:** Gray-200 (#e5e7eb)
- **Success:** Green-600 (#16a34a)
- **Warning:** Yellow-600 (#ca8a04)
- **Error:** Red-600 (#dc2626)

### 4.2 Typography
- **Font Family:** Apple system fonts (San Francisco, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
- **Headings:** Bold, Gray-900
- **Body:** Regular, Gray-700
- **Secondary:** Regular, Gray-600

### 4.3 Components
- **Buttons:** Orange-600 background, white text, rounded-lg
- **Cards:** White background, border-gray-200, shadow-sm, rounded-xl
- **Inputs:** White background, border-gray-300, focus:ring-orange-500
- **Badges:** Colored background, rounded-full

### 4.4 Spacing
- **Container Padding:** px-6 py-8
- **Section Gap:** space-y-6
- **Card Padding:** p-6
- **Button Padding:** px-4 py-2

---

## 5. API Endpoints

### 5.1 Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### 5.2 Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/dashboard/metrics` - Get dashboard metrics

### 5.3 Projects
- `GET /api/projects` - Get all projects (optional: ?client_id=)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### 5.4 Chat
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/conversations/:id` - Get conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `DELETE /api/chat/conversations/:id` - Delete conversation

### 5.5 Admin Chat
- `POST /api/admin-chat/conversations/:id/messages` - Send admin message
- `GET /api/admin-chat/insights` - Get insights
- `POST /api/admin-chat/generate-recommendations` - Generate recommendations

### 5.6 Content Ideas
- `POST /api/content-ideas/generate` - Generate content ideas

### 5.7 Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings/:key` - Update setting

### 5.8 Other Endpoints
- `GET /api/keyword-analysis/analyze` - Keyword analysis
- `POST /api/content-evidence/analyze` - Content evidence
- `POST /api/local-seo/analyze` - Local SEO analysis
- `POST /api/programmatic-seo/generate` - Programmatic SEO
- `GET /api/export/keywords` - Export keywords
- `GET /api/export/content` - Export content
- `GET /api/reports/generate` - Generate report

**Total:** 31 API route groups

---

## 6. Database Schema

### 6.1 Core Tables
- `clients` - Client information
- `projects` - Project details
- `content` - Generated content
- `users` - User accounts and roles
- `chat_conversations` - Chat conversations
- `chat_messages` - Chat messages
- `client_knowledge_base` - Client context for chat
- `admin_insights` - Admin recommendations

### 6.2 Indexes
- `idx_clients_tapverse_id` - Client lookup
- `idx_projects_client_id` - Project lookup by client
- `idx_content_project_id` - Content lookup by project
- `idx_chat_conversations_user_id` - Chat lookup by user
- `idx_chat_messages_conversation_id` - Message lookup by conversation

---

## 7. Feature Status

### 7.1 ✅ Implemented & Production Ready
- Authentication & Authorization
- Clients Dashboard (SEMrush-style)
- Projects Management
- Chat (General, Admin, Client)
- Content Generation (SEO, Social, Ads)
- Keyword Analysis
- Local SEO
- Programmatic SEO
- Content Ideas & Gaps
- Settings (API Keys, Users, General, Integrations)
- Export & Reporting
- Rank Tracking
- Task Management
- Theme & Design System

### 7.2 🔄 In Progress
- Month-on-month graphs (sections ready, needs chart library)
- Full task management UI (backend ready, UI pending)
- Full connections management UI (backend ready, UI pending)

### 7.3 📋 Planned
- Google OAuth integration
- Video content generation (HeyGen + ElevenLabs)
- Image generation (OpenAI, Leonardo.ai, Stability.ai, Ideogram.ai)
- Social media publishing automation
- Advanced analytics dashboards
- Content calendar visualization
- Automated monthly report emails

---

## 8. Deployment

### 8.1 Server
- **OS:** Ubuntu 20.04+
- **Web Server:** Nginx
- **Process Manager:** Screen sessions
- **SSL:** Let's Encrypt (HTTPS)
- **Domain:** app.tapverse.ai

### 8.2 Frontend
- **Port:** 3001
- **Build:** Vite
- **Host:** app.tapverse.ai

### 8.3 Backend
- **Port:** 5001
- **Runtime:** Node.js
- **Process:** Screen session

---

## 9. Known Limitations

1. **Logo & Favicon:** User must add `logo.png` and `favicon.png` to `frontend/public/` manually
2. **Graphs/Charts:** Month-on-month graphs are placeholders (sections ready, needs chart library)
3. **Full Task Management:** Tasks section in Clients dashboard is placeholder (backend ready, UI pending)
4. **Content Ideas Storage:** Content ideas are displayed immediately but not stored in database yet

---

## 10. Future Enhancements

1. **Dashboard Charts:** Add Recharts or Chart.js for visual metrics
2. **Content Ideas Storage:** Store generated ideas in database for future reference
3. **Task Management UI:** Full UI for task creation, assignment, and tracking
4. **Connections UI:** Full UI for managing Google, social media, and e-commerce connections
5. **Video Content:** HeyGen + ElevenLabs integration
6. **Image Generation:** OpenAI, Leonardo.ai, Stability.ai, Ideogram.ai integration
7. **Social Publishing:** Automated posting to LinkedIn, Twitter, Instagram, TikTok
8. **Email Reports:** Automated monthly client report emails
9. **Content Calendar:** Visual calendar for content scheduling
10. **Advanced Analytics:** More detailed analytics dashboards

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Production Ready ✅
