# Claude Model Selection Guide

## How to Decide Which Model to Use

### Step 1: Test Available Models

Run the model test script on the server:

```bash
cd backend
node src/services/test-models.mjs
```

This will test all available Claude models with your API key and show which ones work.

### Step 2: Choose Based on Your Needs

**For Content Generation (Recommended):**
- **Claude 3.5 Sonnet** - Best balance of quality, speed, and cost
  - Best for: Blog posts, social media content, ads copy
  - Speed: Fast
  - Cost: Medium
  - Quality: High

**Alternatives:**
- **Claude 3 Opus** - Highest quality, slower, more expensive
  - Best for: Complex analysis, high-quality content
- **Claude 3 Sonnet** - Good quality, fast, cost-effective
  - Best for: General content generation
- **Claude 3 Haiku** - Fastest, cheapest, good for simple tasks
  - Best for: Quick responses, simple content

### Step 3: Configure Model

After testing, set the model in `.env`:

```bash
CLAUDE_MODEL=claude-3-5-sonnet-20241022  # or whichever model works
```

Or keep it as default in code (configurable via environment variable).

## Current Setup

- **Default Model:** `claude-3-5-sonnet-20241022` (can be overridden)
- **Configuration:** Set via `CLAUDE_MODEL` environment variable
- **Fallback:** Uses default if not set

## Recommendation for This Project

Based on the project scope (content automation for blogs, social media, ads):

**Recommended: Claude 3.5 Sonnet**
- Best quality for content generation
- Fast enough for production use
- Reasonable cost for 10 clients
- Good balance for all content types

## Testing

Test models with:
```bash
node src/services/test-models.mjs
```

This will show which models work with your API key.

