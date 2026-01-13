#!/bin/bash

# Script to connect and set up server
# This will prompt for password or use SSH keys

SERVER_IP="77.42.67.166"
PROJECT_DIR="/root/tapverse-content-creation"

echo "Connecting to server $SERVER_IP..."
echo ""

# Try common usernames
for USER in root ubuntu sanketpatel; do
    echo "Trying user: $USER"
    ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $USER@$SERVER_IP "echo 'Connected as $USER'" 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Successfully connected as $USER"
        break
    fi
done

echo ""
echo "To connect manually:"
echo "  ssh root@$SERVER_IP"
echo "  ssh ubuntu@$SERVER_IP"
echo "  ssh sanketpatel@$SERVER_IP"
echo ""
echo "Or use your SSH key:"
echo "  ssh -i ~/.ssh/your_key $USER@$SERVER_IP"

