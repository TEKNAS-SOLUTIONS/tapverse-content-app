# API Keys Configuration Guide

## 🔒 Security Notice

**NEVER commit API keys to GitHub!** All `.env` files are automatically ignored by Git.

## Required API Keys

### Frontend API Keys

Create a `.env` file in the `frontend/` directory:

```env
VITE_GOOGLE_PLACES_API_KEY=your-api-key-here
```

**Current Key:** Already configured in `frontend/.env` (not in Git)

### Backend API Keys

Create a `.env` file in the `backend/` directory with:

```env
# Anthropic/Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/connections/google/callback

# DataForSEO
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tapverse_content
DB_USER=postgres
DB_PASSWORD=your-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Setup Instructions

1. **Copy the example file:**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env
   
   # Backend
   cp backend/.env.example backend/.env
   ```

2. **Add your actual API keys** to the `.env` files

3. **Verify `.env` is in `.gitignore`** (it should be by default)

4. **Restart your dev server** after adding keys

## Adding New API Keys

When adding new API keys in the future:

1. Add the key to `.env` file (never commit this)
2. Add a placeholder to `.env.example` (this CAN be committed)
3. Update this README if needed
4. Use `import.meta.env.VITE_*` for frontend (Vite)
5. Use `process.env.*` for backend (Node.js)

## Verification

To verify your keys are NOT in Git:

```bash
git status
# Should NOT show .env files

git check-ignore frontend/.env backend/.env
# Should show the file paths (meaning they're ignored)
```

## Production Deployment

For production, set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Heroku: `heroku config:set KEY=value`
- AWS: Use Secrets Manager or Parameter Store
- Docker: Use environment variables or secrets

**Never hardcode API keys in your code!**
