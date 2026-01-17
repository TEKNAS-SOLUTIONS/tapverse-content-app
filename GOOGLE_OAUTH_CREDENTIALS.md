# Google OAuth Credentials - Production Setup

## Your Credentials

**⚠️ IMPORTANT: Credentials are stored in `.env` file (not committed to Git)**

**Client ID:** `your-client-id.apps.googleusercontent.com`  
**Client Secret:** `GOCSPX-your-client-secret`

**Note:** Replace with your actual credentials from Google Cloud Console

## Redirect URI Configuration

### For Google Cloud Console

Add these **Authorized redirect URIs** in your OAuth 2.0 Client ID settings:

1. **Local Development:**
   ```
   http://localhost:3000/connections/google/callback
   ```

2. **Production Server (HTTPS):**
   ```
   https://app.tapverse.ai/connections/google/callback
   ```
   
   **⚠️ IMPORTANT:** 
   - Google OAuth does NOT accept IP addresses (like `77.42.67.166`). You MUST use a domain name.
   - HTTPS is recommended for production (more secure, required for some Google APIs)

### How to Add Redirect URIs

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", click "ADD URI"
4. Add each URI above (one at a time)
5. Click "SAVE"

## Environment Variables

### For Local Development (.env)

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/connections/google/callback
FRONTEND_URL=http://localhost:3000
```

### For Production Server (.env)

**Production Configuration (app.tapverse.ai):**

**Production Configuration (HTTPS):**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback
FRONTEND_URL=https://app.tapverse.ai
```

**Note:** Make sure HTTPS is set up on your server before using this. See `HTTPS_SETUP_GUIDE.md` for instructions.

**Note:** Make sure your DNS A record is set: `app.tapverse.ai` → `77.42.67.166`

## Important Notes

1. **Redirect URI must match exactly** - including protocol (http/https), port, and path
2. **Add both local and production URIs** to Google Cloud Console so you can test locally
3. **After updating redirect URIs in Google Cloud**, changes take effect immediately
4. **Never commit `.env` file** to Git (it's already in .gitignore)

## Testing

1. Update your `.env` file with the credentials above
2. Restart your backend server
3. Go to Connections page in the app
4. Try connecting a Google service
5. You should be redirected to Google OAuth consent screen

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in `.env` matches exactly what's in Google Cloud Console
- Check for trailing slashes, http vs https, port numbers
- Wait a few seconds after updating in Google Cloud Console

### Still Not Working?
- Check that the frontend is accessible at the URL you specified
- Verify the frontend route `/connections/google/callback` exists
- Check browser console and backend logs for errors
