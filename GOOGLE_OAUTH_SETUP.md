# Google OAuth Setup Guide

## Prerequisites

To connect Google services (Google Ads, Search Console, Analytics), you need to set up OAuth 2.0 credentials in Google Cloud Console.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Note your Project ID

## Step 2: Enable Required APIs

Enable the following APIs for your project:

1. **Google Ads API**
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Google Ads API"
   - Click "Enable"

2. **Google Search Console API**
   - Search for "Google Search Console API"
   - Click "Enable"

3. **Google Analytics API**
   - Search for "Google Analytics API" or "Analytics Reporting API"
   - Click "Enable"

4. **Google My Business API** (if needed)
   - Search for "Google My Business API"
   - Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen first:
   - Choose "Internal" (for Tapverse internal use) or "External"
   - Fill in required fields:
     - App name: "Tapverse Content Automation"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes (these will be requested during OAuth):
     - `https://www.googleapis.com/auth/adwords` (Google Ads)
     - `https://www.googleapis.com/auth/webmasters.readonly` (Search Console)
     - `https://www.googleapis.com/auth/analytics.readonly` (Analytics)
     - `https://www.googleapis.com/auth/business.manage` (Google My Business)
   - Save and continue through the steps

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Tapverse Content App"
   - Authorized redirect URIs (add BOTH):
     - `http://localhost:3000/connections/google/callback` (for local development)
     - `https://app.tapverse.ai/connections/google/callback` (for production)
   - **⚠️ IMPORTANT:** Google OAuth does NOT accept IP addresses. You MUST use a domain name.
   - Click "Create"

5. Copy your credentials:
   - **Client ID**: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 4: Configure Environment Variables

Add to your `.env` file:

**For Local Development:**
```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/connections/google/callback
FRONTEND_URL=http://localhost:3000
```

**For Production:**
```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
# Use your actual server URL (IP or domain)
GOOGLE_REDIRECT_URI=http://77.42.67.166:3000/connections/google/callback
# OR if on port 80: http://77.42.67.166/connections/google/callback
# OR if using domain: https://yourdomain.com/connections/google/callback
FRONTEND_URL=http://77.42.67.166:3000
```

**Note:** The redirect URI must match exactly what you added in Google Cloud Console, including protocol (http/https) and port number.

## Step 5: Google Ads API Additional Setup

For Google Ads API specifically, you also need:

1. **Google Ads Developer Token**
   - Go to [Google Ads](https://ads.google.com/)
   - Navigate to Tools & Settings → Setup → API Center
   - Apply for a Developer Token (may take 24-48 hours for approval)
   - Copy the Developer Token

2. **Add to environment variables:**
   ```env
   GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token-here
   ```

## Step 6: Test Connection

1. Start your backend server
2. Go to Connections page in the app
3. Click "Connect" for any Google service
4. You should be redirected to Google OAuth consent screen
5. Authorize the app
6. You should be redirected back and see the connection created

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in your `.env` matches exactly what's configured in Google Cloud Console
- Check for trailing slashes, http vs https, port numbers

### "access_denied" Error
- User may have denied access
- Try connecting again

### "invalid_client" Error
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Make sure there are no extra spaces or quotes in the .env file

### APIs Not Enabled
- Go back to API Library and ensure all required APIs are enabled
- Wait a few minutes after enabling for changes to propagate

### Google Ads API Errors
- Make sure you have a Developer Token
- Developer Token must be approved (not pending)
- The Google account used for OAuth must have access to the Google Ads accounts you want to manage

## Security Notes

- **Never commit `.env` file to Git**
- Store credentials securely
- Use different OAuth credentials for development and production
- Regularly rotate client secrets
- Limit OAuth scopes to only what's needed

## Required Scopes Summary

The app requests these scopes:
- `https://www.googleapis.com/auth/adwords` - Google Ads management
- `https://www.googleapis.com/auth/webmasters.readonly` - Search Console read-only
- `https://www.googleapis.com/auth/analytics.readonly` - Analytics read-only
- `https://www.googleapis.com/auth/business.manage` - Google My Business management

## Next Steps

Once OAuth is configured:
1. Connect Google accounts from the Connections page
2. Assign connections to clients when creating/editing them
3. Use connections in features (Google Ads strategy, Search Console data, etc.)
