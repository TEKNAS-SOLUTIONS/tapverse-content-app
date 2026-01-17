# Simple Setup - Just Copy & Paste

Since we're both on Windows, here's the easiest way:

## Option 1: Use Windows Terminal / PowerShell

1. **Open PowerShell or Windows Terminal**

2. **Navigate to project folder:**
   ```powershell
   cd C:\Users\sanke\projects\tapverse-content-app
   ```

3. **Upload and run (you'll be prompted for password):**
   ```powershell
   scp setup-all.sh root@77.42.67.166:/root/setup-all.sh
   ssh root@77.42.67.166 "chmod +x /root/setup-all.sh && bash /root/setup-all.sh"
   ```

## Option 2: Use PuTTY / WinSCP

1. **Upload the file:**
   - Open WinSCP or use PuTTY SCP
   - Connect to: `root@77.42.67.166`
   - Upload `setup-all.sh` to `/root/`

2. **Run via PuTTY:**
   - Open PuTTY
   - Connect to: `77.42.67.166`
   - Login as: `root`
   - Run: `bash /root/setup-all.sh`

## Option 3: Copy-Paste Directly (Easiest!)

1. **Open PuTTY or Windows Terminal**
2. **SSH to server:**
   ```bash
   ssh root@77.42.67.166
   ```
3. **Copy the entire block from `COPY_PASTE_THIS.md` and paste it**

## What You Need

- SSH access to `root@77.42.67.166`
- Either:
  - SSH key set up (passwordless), OR
  - Know the root password (you'll be prompted)

The script will do everything automatically once it runs!
