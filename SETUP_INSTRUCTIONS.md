# Setup Instructions

## Automated Setup (Recommended)

Run this script - it will install everything and get tests passing:

```bash
./setup-complete.sh
```

**Note:** This script requires your password for Homebrew installation (one-time setup).

## What the script does:

1. ✅ Installs Homebrew (if needed)
2. ✅ Installs PostgreSQL 14
3. ✅ Starts PostgreSQL service
4. ✅ Creates database `tapverse_content`
5. ✅ Runs database migrations
6. ✅ Runs tests (they should all pass!)

## After Setup

Once the script completes successfully and tests pass, you're ready to continue development!

**Status:** ⏳ Waiting for database setup → Tests must pass → Then proceed

---

## Alternative: Manual Setup

If you prefer manual setup, see `SETUP_DATABASE.md` for step-by-step instructions.
