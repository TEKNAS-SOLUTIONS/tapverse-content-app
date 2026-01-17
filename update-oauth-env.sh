#!/bin/bash

# Update OAuth Environment Variables Script
# Run this after HTTPS is set up: bash update-oauth-env.sh

set -e

ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found at $ENV_FILE"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "🔧 Updating OAuth configuration in .env file..."
echo ""

# Backup existing .env
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created: ${ENV_FILE}.backup.*"

# Update or add Google OAuth variables
if grep -q "GOOGLE_CLIENT_ID=" "$ENV_FILE"; then
    sed -i 's|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com|' "$ENV_FILE"
else
    echo "" >> "$ENV_FILE"
    echo "# Google OAuth Credentials" >> "$ENV_FILE"
    echo "GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" >> "$ENV_FILE"
fi

if grep -q "GOOGLE_CLIENT_SECRET=" "$ENV_FILE"; then
    sed -i 's|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret|' "$ENV_FILE"
else
    echo "GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret" >> "$ENV_FILE"
fi

if grep -q "GOOGLE_REDIRECT_URI=" "$ENV_FILE"; then
    sed -i 's|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback|' "$ENV_FILE"
else
    echo "GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback" >> "$ENV_FILE"
fi

if grep -q "FRONTEND_URL=" "$ENV_FILE"; then
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://app.tapverse.ai|' "$ENV_FILE"
else
    echo "FRONTEND_URL=https://app.tapverse.ai" >> "$ENV_FILE"
fi

echo "✅ OAuth configuration updated in .env file"
echo ""
echo "📋 Updated values:"
echo "   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
echo "   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret"
echo "   GOOGLE_REDIRECT_URI=https://app.tapverse.ai/connections/google/callback"
echo "   FRONTEND_URL=https://app.tapverse.ai"
echo ""
echo "🔄 Next: Restart your backend server"
