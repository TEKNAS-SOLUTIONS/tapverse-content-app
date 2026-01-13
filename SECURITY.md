# Security Guide - API Key Management

## ⚠️ CRITICAL: Never Commit API Keys to Git

This document outlines how to securely manage API keys to prevent exposure on GitHub or other version control systems.

## Current Security Measures

### ✅ What's Protected

1. **`.gitignore` Configuration**
   - All `.env` files are ignored
   - Pattern: `*.env`, `.env*`
   - Location: `.gitignore` (root and backend directories)

2. **Environment Variable Storage**
   - API keys are stored in `.env` files (not committed)
   - API keys can also be stored in database (`system_settings` table)
   - No hardcoded keys in source code

3. **Configuration Flow**
   ```
   .env file → process.env → config.js → services
   OR
   Database (system_settings) → services
   ```

## How to Update API Keys

### Method 1: Environment File (Recommended for Server)

1. **On Local Machine:**
   ```bash
   # Create/update backend/.env
   cd backend
   echo "ANTHROPIC_API_KEY=your_new_key_here" >> .env
   ```

2. **On Server:**
   ```bash
   ssh root@77.42.67.166
   cd /root/tapverse-content-creation/backend
   nano .env  # Add or update ANTHROPIC_API_KEY
   # Restart backend
   pkill -f "node src/server"
   node src/server.js &
   ```

### Method 2: Database (Recommended for Production)

1. **Via Admin Setup UI:**
   - Go to Admin Setup page
   - Update "Anthropic API Key" field
   - Click "Save Settings"

2. **Via Database:**
   ```sql
   UPDATE system_settings 
   SET setting_value = 'your_new_key_here'
   WHERE setting_key = 'anthropic_api_key';
   ```

## Security Checklist

Before committing code:

- [ ] No API keys in source code files
- [ ] No API keys in commit messages
- [ ] `.env` files are in `.gitignore`
- [ ] All `.env*` patterns are ignored
- [ ] No keys in documentation (use placeholders)
- [ ] No keys in test files (use mocks or env vars)

## If API Key is Exposed

1. **Immediately:**
   - Revoke the exposed key from the API provider
   - Generate a new key
   - Update the key using Method 1 or 2 above

2. **Clean Git History (if needed):**
   ```bash
   # Remove from recent commits (use with caution)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Verify:**
   ```bash
   # Check if key exists in git history
   git log -p --all -S "sk-ant-api03" | head -50
   ```

## Best Practices

1. **Use Environment Variables**
   - Always use `process.env.API_KEY_NAME`
   - Never hardcode in source code

2. **Use `.env.example` for Documentation**
   ```bash
   # .env.example (committed)
   ANTHROPIC_API_KEY=your_api_key_here
   
   # .env (NOT committed)
   ANTHROPIC_API_KEY=sk-ant-api03-actual-key...
   ```

3. **Rotate Keys Regularly**
   - Change API keys every 90 days
   - Use different keys for dev/staging/production

4. **Monitor API Usage**
   - Set up alerts for unusual activity
   - Review API logs regularly

## Current API Key Configuration

- **Storage:** Database (`system_settings` table) + `.env` file
- **Priority:** Database value overrides `.env` if both exist
- **Update Method:** Admin Setup UI or direct database update

## Verification Commands

```bash
# Check if .env is ignored
git check-ignore backend/.env

# Verify no keys in codebase
grep -r "sk-ant-api03" --exclude-dir=node_modules .

# Check git history for keys (should return nothing)
git log -p --all -S "sk-ant-api03" | head -20
```

