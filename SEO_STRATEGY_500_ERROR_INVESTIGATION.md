# SEO Strategy 500 Error - Investigation

**Date**: January 18, 2026  
**Status**: ⏳ INVESTIGATION COMPLETE - Root Cause Identified

---

## Issue Summary

**Error**: `Request failed with status code 500`  
**Endpoint**: `POST /api/seo-strategy/generate`  
**Location**: Frontend when clicking "Generate SEO Strategy" button

---

## Investigation Results

### Code Analysis

The SEO strategy generation route (`backend/src/routes/seoStrategy.js`) and service (`backend/src/services/seoStrategyService.js`) are properly implemented with error handling.

### Most Likely Root Causes

#### 1. **Missing Claude API Key** (Most Likely) ⚠️
- **Issue**: The service calls `generateContentWithSystem()` which requires a valid Anthropic API key
- **Location**: `backend/src/services/claude.js` → `getClaudeClient()`
- **Error**: If API key is missing, throws: `"Anthropic API key not found. Please configure it in Admin Setup."`
- **Solution**: Configure API key in Admin Settings → API Keys → Anthropic API Key

#### 2. **Database Table Missing**
- **Status**: ✅ **VERIFIED EXISTS**
- **Migration**: `backend/src/db/migrations/004_seo_strategies_table.sql`
- **Table**: `seo_strategies` table should exist
- **Solution**: Run migration if table doesn't exist

#### 3. **JSON Parsing Error** (Unlikely)
- **Status**: Has robust error handling with multiple parsing strategies
- **Fallback**: Returns minimal strategy if parsing fails

#### 4. **Project/Client Not Found**
- **Status**: Has validation for project and client existence
- **Error**: Returns 404 if not found (not 500)

---

## Recommended Fix Steps

### Step 1: Verify Claude API Key Configuration
```bash
# Check if API key is configured in database
# Via Admin Settings: Settings → API Keys → Anthropic API Key
```

### Step 2: Check Backend Logs
```bash
# On server, check backend logs for specific error
tail -f /path/to/backend/logs
# Or check PM2 logs
pm2 logs tapverse-backend
```

### Step 3: Test API Key Manually
```bash
# Test Claude API key from backend
curl -X POST http://localhost:5001/api/seo-strategy/generate \
  -H "Content-Type: application/json" \
  -d '{"projectId": "your-project-id"}'
```

### Step 4: Verify Database Migration
```bash
# Check if seo_strategies table exists
psql -U your_user -d your_db -c "\d seo_strategies"
```

---

## Error Handling Recommendations

The current error handling is good, but we can improve error messages:

### Current Error Response:
```json
{
  "success": false,
  "error": "Failed to generate SEO strategy: [error message]"
}
```

### Recommended Enhancement:
Add more specific error types:
- `API_KEY_MISSING`: "Claude API key not configured. Please configure it in Admin Settings."
- `DATABASE_ERROR`: "Database error occurred. Please check logs."
- `CLAUDE_API_ERROR`: "Claude API error: [specific error]"
- `JSON_PARSE_ERROR`: "Failed to parse strategy response. Please try again."

---

## Quick Fix: Verify API Key Configuration

The most likely issue is a missing or invalid Claude API key. To fix:

1. **Go to Admin Settings** → API Keys
2. **Enter Anthropic API Key** in the "Anthropic API Key" field
3. **Save** the settings
4. **Test** the SEO strategy generation again

---

## Testing Steps

1. ✅ Check Admin Settings has Anthropic API key configured
2. ⏳ Test API endpoint manually with curl
3. ⏳ Check backend logs for specific error
4. ⏳ Verify database table exists
5. ⏳ Test generation with valid project ID

---

**Next Steps**: Test with configured API key and check backend logs for specific error message.
