# Tapverse Content Automation System

Internal content automation system for Tapverse - automating SEO content, social content, ads, and AI avatar videos.

## Project Structure

```
tapverse-content-creation/
├── backend/          # Node.js/Express backend API
├── frontend/         # React frontend
└── project-scope.md  # Complete technical specification
```

## Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL
- Redis (Bull queue)
- Claude API

**Frontend:**
- React 18+
- Vite
- TailwindCSS
- Zustand

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API keys
npm run db:migrate
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Development Approach

This project uses **test-driven development (TDD)** - features are built and tested incrementally as we develop, not at the end.

### Running Tests

**Backend:**
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:ui
npm run test:coverage
```

## Phase 1: Core MVP

**Deliverables:**
1. Blog content generation (SEO optimized)
2. LinkedIn posts generation
3. Google Ads copy + strategy
4. Facebook Ads copy + strategy

## Project Reference

See `project-scope.md` for complete technical specification.

