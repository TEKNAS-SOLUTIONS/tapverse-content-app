# Integration Testing Guide

## Overview

Integration tests verify that the frontend correctly communicates with the backend API.

## Test Structure

### 1. API Structure Tests (`src/__tests__/integration/api-structure.test.js`)
- Validates API service structure
- Verifies methods match backend endpoints
- Ensures response format compatibility

### 2. Clients Integration Tests (`src/__tests__/integration/clients.integration.test.jsx`)
- Tests actual API calls to backend
- Verifies CRUD operations
- Tests response structure matching

## Running Integration Tests

### Prerequisites

1. **Backend must be running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Backend must be accessible:**
   - Default: `http://localhost:5000`
   - Or set `VITE_API_URL` environment variable

### Run Tests

```bash
cd frontend
npm test -- integration
```

### Run Specific Integration Test

```bash
npm test -- clients.integration.test.jsx
npm test -- api-structure.test.js
```

## Test Behavior

### API Structure Tests
- **Always run** - No backend required
- Validates code structure and method signatures

### Integration Tests
- **Skip gracefully** if backend not available
- Will test actual API calls if backend is running
- Create and cleanup test data automatically

## Environment Variables

```bash
# Set backend URL (optional, defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

## Notes

- Integration tests are designed to skip if backend is not available
- Tests create test data and clean up after themselves
- Backend tests are separate and run independently
- Frontend integration tests verify frontend-backend compatibility

## Backend API Endpoints Verified

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Response Format

All backend API responses follow this structure:

```javascript
{
  success: boolean,
  data: any,
  error?: string
}
```

Frontend API service expects this format and integration tests verify it.

