# Domain Setup for Google OAuth

## Problem

Google OAuth requires redirect URIs to use a **domain name** (like `example.com`), not an IP address (like `77.42.67.166`).

## Solution: Set Up a Domain Name

You have several options:

### Option 1: Use an Existing Domain

If you already have a domain (e.g., `tapverse.com`):

1. **Add DNS A Record:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add an A record:
     - **Name:** `app` (or `content`, `dashboard`, etc.)
     - **Type:** A
     - **Value:** `77.42.67.166`
     - **TTL:** 3600 (or default)
   - This creates: `app.tapverse.com` → `77.42.67.166`

2. **Use in OAuth:**
   - Redirect URI: `https://app.tapverse.com/connections/google/callback`
   - Frontend URL: `https://app.tapverse.com`

### Option 2: Get a Free Domain

If you don't have a domain:

1. **Free Options:**
   - [Freenom](https://www.freenom.com/) - Free `.tk`, `.ml`, `.ga` domains
   - [No-IP](https://www.noip.com/) - Free dynamic DNS
   - [DuckDNS](https://www.duckdns.org/) - Free subdomain

2. **Paid Options (Recommended):**
   - [Namecheap](https://www.namecheap.com/) - ~$10/year for `.com`
   - [Google Domains](https://domains.google/) - Simple domain management
   - [Cloudflare](https://www.cloudflare.com/products/registrar/) - At-cost pricing

### Option 3: Use a Subdomain Service

1. **No-IP Setup:**
   - Sign up at [noip.com](https://www.noip.com/)
   - Create a hostname: `tapverse-content.ddns.net`
   - Install No-IP DUC (Dynamic Update Client) on your server
   - Use: `https://tapverse-content.ddns.net/connections/google/callback`

2. **DuckDNS Setup:**
   - Sign up at [duckdns.org](https://www.duckdns.org/)
   - Create subdomain: `tapverse-content.duckdns.org`
   - Update IP: `77.42.67.166`
   - Use: `https://tapverse-content.duckdns.org/connections/google/callback`

## Quick Setup Steps

### 1. Choose Your Domain

Example: `app.tapverse.com` or `tapverse-content.duckdns.org`

### 2. Configure DNS

**If using your own domain:**
- Add A record: `app` → `77.42.67.166`

**If using DuckDNS/No-IP:**
- Follow their setup instructions
- Point to `77.42.67.166`

### 3. Update Google Cloud Console

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add redirect URI: `https://yourdomain.com/connections/google/callback`
4. Save

### 4. Update Server .env

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/connections/google/callback
FRONTEND_URL=https://yourdomain.com
```

### 5. Configure Web Server (if needed)

If your frontend is behind a reverse proxy (nginx/Apache):

**Nginx example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**For HTTPS (recommended):**
- Use [Let's Encrypt](https://letsencrypt.org/) for free SSL certificate
- Or use Cloudflare (free SSL)

### 6. Test

1. Wait for DNS to propagate (can take a few minutes to 24 hours)
2. Verify domain resolves: `ping yourdomain.com` should show `77.42.67.166`
3. Try connecting Google OAuth from the app

## Recommended: Use Cloudflare

1. Sign up at [Cloudflare](https://www.cloudflare.com/)
2. Add your domain
3. Update nameservers at your registrar
4. Add A record: `app` → `77.42.67.166`
5. Enable SSL/TLS (free)
6. Use: `https://app.yourdomain.com`

## Temporary Workaround (Development Only)

For local development, you can use:
- `http://localhost:3000/connections/google/callback` ✅ (works)

For production, you **MUST** use a domain name.

## Summary

**What you need:**
1. A domain name (your own or free subdomain)
2. DNS pointing to `77.42.67.166`
3. Update Google OAuth redirect URI to use the domain
4. Update `.env` file on server

**Example redirect URIs:**
- ✅ `https://app.tapverse.com/connections/google/callback`
- ✅ `https://tapverse-content.duckdns.org/connections/google/callback`
- ❌ `http://77.42.67.166:3000/connections/google/callback` (IP not allowed)
