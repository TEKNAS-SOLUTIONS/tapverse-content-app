# SSH Setup Guide for Dev Server

**Server:** 77.42.67.166  
**User:** root  
**Purpose:** Access to Tapverse Content Creation dev server

---

## 🔐 SSH Key Information

### Current Public Key
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDKZFAoDMeBrdXeIKPIREVwVUvuwAZHHLKzgRAh68/osrbq9Ey8tJeM3kdD3YM5PvRIelqjUzM5bJ5HA4gM+Wwyy5VyMyJkcE8oeYusanS5oHQjnXo6wD+FyMfAF83DanDio1hCr/zsNoiIgjg+t5Uyp2jTC8z3iUrQ7u3NTe0P0VII8lZ2nDn464OmHF0LiFWvEUOQW6gISLEhBdeyPc49B/kw4UImh3enzCfFpMCKAUvM8e9nvgaTkRVbTcUY1IYnhxkgMwWdxNhL7xNrhc5gXXUtqG4l2J9T+LjQCFQqz32lkejVVS7i/c2i7iXaYUvHOutoVwwa3weX6NDp+so6WYEmwj9SulqYjHuqA0TT5fVnmbFpvyKZcaCQbQB2yUCNeokj/Eg/y25EWHgtzAcyquSjrBQ7ZV6Ht7ltspRRqG+02o4v1eCQNopJ9FZckBprCI58zDCNBD4NBTowiHOqniGLemY5zZaPn1GnjlEBdoUETAiyDygo00eL4+15o4PIn6ob4pC5/bUslFp5TSBRF5YMi25HBm7mxrHBGkOMKfx0/SPoDmJCAkcd/FLlzrEFbSomHwGA/u7lpyQWKkvQIfwVnAmG2zYPJKODgFWgVd5obD5K1pY3H02M2s8Y4+/Zp1JTv6LBm15S+EKum189KDboYkkagEaZ00ynVDTsBQ== sanket@teknas.com.au
```

**Key Fingerprint:** `SHA256:7o0M9YlPCQnCe9tRWLDTEnDD1l1jgsNx8D2eowQpK40`  
**Key Type:** RSA 4096-bit  
**Email:** sanket@teknas.com.au

---

## 🖥️ Setup Instructions for New PC

### For Cursor AI: Follow these steps to set up SSH access

1. **Generate SSH Key Pair:**
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -C "sanket@teknas.com.au"
   ```
   - When prompted for passphrase, user can press Enter (no passphrase) or set one
   - This creates:
     - Private key: `~/.ssh/id_rsa` (keep secret, never share)
     - Public key: `~/.ssh/id_rsa.pub` (safe to share)

2. **Set Correct Permissions:**
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/id_rsa
   chmod 644 ~/.ssh/id_rsa.pub
   ```

3. **Copy Public Key to Server:**
   
   **Option A: Using ssh-copy-id (recommended):**
   ```bash
   ssh-copy-id root@77.42.67.166
   ```
   - This will prompt for password once (if password auth is enabled)
   - Then future connections won't need password
   
   **Option B: Manual method:**
   ```bash
   # Display public key
   cat ~/.ssh/id_rsa.pub
   
   # Then SSH to server and add it manually:
   ssh root@77.42.67.166
   # On server:
   mkdir -p ~/.ssh
   echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```

4. **Test Connection:**
   ```bash
   ssh root@77.42.67.166
   ```
   - Should connect without password prompt
   - If it works, you'll see server command prompt

5. **Optional: Add to SSH Config:**
   ```bash
   # Create/edit ~/.ssh/config
   nano ~/.ssh/config
   
   # Add this entry:
   Host tapverse-dev
       HostName 77.42.67.166
       User root
       IdentityFile ~/.ssh/id_rsa
   
   # Then you can connect with:
   ssh tapverse-dev
   ```

---

## 📋 Quick Setup Script for Cursor

**If user asks Cursor to set up SSH, run these commands:**

```bash
# 1. Generate key (if doesn't exist)
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -C "sanket@teknas.com.au" -N ""
fi

# 2. Set permissions
chmod 700 ~/.ssh 2>/dev/null || mkdir -p ~/.ssh && chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub 2>/dev/null || true

# 3. Display public key for user to copy to server
echo ""
echo "=== PUBLIC KEY (copy this to server) ==="
cat ~/.ssh/id_rsa.pub
echo ""
echo "=== END OF PUBLIC KEY ==="
echo ""
echo "Next steps:"
echo "1. Copy the public key above"
echo "2. Run: ssh-copy-id root@77.42.67.166"
echo "   OR manually add to server's ~/.ssh/authorized_keys"
echo "3. Test: ssh root@77.42.67.166"
```

---

## 🔄 Alternative: If You Have the Original Private Key

**If you have access to the original `~/.ssh/id_rsa` file from the old PC:**

1. **Copy private key file to new PC** (via USB, cloud storage, etc.)
2. **Place it in `~/.ssh/id_rsa`**
3. **Set permissions:**
   ```bash
   chmod 600 ~/.ssh/id_rsa
   chmod 700 ~/.ssh
   ```
4. **Test connection:**
   ```bash
   ssh root@77.42.67.166
   ```

**⚠️ IMPORTANT:** Never share your private key (`id_rsa`) publicly or commit it to git. Only the public key (`id_rsa.pub`) is safe to share.

---

## 🔍 Verification Commands

**Check if SSH key exists:**
```bash
ls -la ~/.ssh/id_rsa*
```

**Check key fingerprint (should match):**
```bash
ssh-keygen -lf ~/.ssh/id_rsa.pub
# Should show: SHA256:7o0M9YlPCQnCe9tRWLDTEnDD1l1jgsNx8D2eowQpK40
```

**Test connection with verbose output:**
```bash
ssh -v root@77.42.67.166
```

**Verify key is being used:**
```bash
ssh -v root@77.42.67.166 2>&1 | grep -i "identity\|offering"
```

---

## 🚨 Troubleshooting

### Permission Denied (publickey)
- Check key permissions: `chmod 600 ~/.ssh/id_rsa`
- Verify key is added to server: `ssh root@77.42.67.166` should work
- Check server authorized_keys: `cat ~/.ssh/authorized_keys` (on server)

### Connection Timeout
- Check firewall rules on server
- Verify server IP is correct: `77.42.67.166`
- Test basic connectivity: `ping 77.42.67.166`

### SSH Key Not Found
- Verify key location: `ls -la ~/.ssh/`
- Check SSH config: `cat ~/.ssh/config`
- Specify key explicitly: `ssh -i ~/.ssh/id_rsa root@77.42.67.166`

---

## 📝 Server Information

- **IP Address:** 77.42.67.166
- **User:** root
- **SSH Port:** 22 (default)
- **Project Directory:** `/root/tapverse-content-creation`
- **Backend Port:** 5001
- **Frontend Port:** 3000 (Nginx proxy on port 80)

---

## 🎯 Quick Reference

**Connect to server:**
```bash
ssh root@77.42.67.166
```

**With SSH config alias:**
```bash
ssh tapverse-dev
```

**Copy files to server:**
```bash
scp file.txt root@77.42.67.166:/root/tapverse-content-creation/
```

**Copy files from server:**
```bash
scp root@77.42.67.166:/root/tapverse-content-creation/file.txt ./
```

---

## ✅ Setup Checklist

- [ ] SSH key generated or copied
- [ ] Key permissions set correctly (600 for private, 644 for public)
- [ ] Public key added to server's `~/.ssh/authorized_keys`
- [ ] Connection tested: `ssh root@77.42.67.166` works without password
- [ ] (Optional) SSH config entry added for easier access

---

**Last Updated:** January 2025  
**For Cursor AI:** Follow the "Quick Setup Script" section when user asks to set up SSH access.
