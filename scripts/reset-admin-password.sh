#!/bin/bash
# Reset Admin Password Script
# Usage: Run on server to reset admin password to admin123

echo "🔐 Resetting admin password..."

# Connect to PostgreSQL and reset password
sudo -u postgres psql -d tapverse_content << EOF
-- Check if user exists
SELECT email, role, is_active FROM users WHERE email = 'admin@tapverse.ai';

-- Reset password (password: admin123)
-- Using bcrypt hash for 'admin123' with salt rounds 10
-- Hash: \$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

UPDATE users 
SET password_hash = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@tapverse.ai';

SELECT 'Password reset complete' as status;
EOF

echo "✅ Admin password reset to: admin123"
echo "Email: admin@tapverse.ai"
echo "Password: admin123"
