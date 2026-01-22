# Add SSH Key to Server

## Current Status

✅ SSH key generated on your Windows PC  
⚠️ Public key needs to be added to server

## Your Public Key (copy this):

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDp6+n/7Sz8wfA5CP5uIFwTBDWvRn0BEuAxS16zkw8E/rIGdqSZlIrZs7wn0PEd522+jh9u4yWy/ZNGUKOh1viraH6BYhUBfYfy88//X7vfKGbFl4+wwYoKGbaSKeAbUQnz8z+lkS4XX0PnN/B7TihMwVm5CexWYRn7zfYyUFQ8nbVwjX9Qm/mVbCWooMbKuyeTxAjMoWg+PFX+5SaNEQA8BJ/xh/oH6v2MYuVj55Hjw2bLGn115rwFaCukbPFiJvFiRvZBKtFJKwY96vrxXHRnqBZpg8AJhDaj6/UFrxmGAAvhFiJQ01MqtJITwvWpjbtVh5NrbJFpc6g2PK7ARWKfafnB6jnvNSCBMl6DFffBuZoRAlLxm4h/sC1tbB2RccnZDp4N22OH/JlC/n11qsH1gV/WLPhexb2CalPpA9joKZkMdd0DFIYfPbxK9aJZ6gkVYowLD46vXqKt/Q66QbxGMReNTqZrkI3CGLt0B/xPEafXbQIsU8fGRQ5dlb4VegK1pBfGL/UQYD37bNzURoTGiTsZTwUpTEzi22Ki+8/mYKtS3+kgmBIdY03C6iuMskTe+dQ1LvtNBQMPyfadEPtNhw2B4T8h+CDoqdAbBrufaJATYy+Zsxl6Ae+5mMkPASmHfBToT3qNBUWGNWHv/VCVgMHXaPSBgyO67XzNWRFg7w== sanket@teknas.com.au
```

## Method 1: Using ssh-copy-id (Requires Password)

On your Windows PowerShell:

```powershell
# You'll be prompted for the root password
ssh-copy-id root@77.42.67.166
```

If `ssh-copy-id` is not available, use Method 2.

## Method 2: Manual Copy (Recommended)

1. **SSH to server with password:**
   ```powershell
   ssh root@77.42.67.166
   ```
   (Enter password when prompted)

2. **On the server, run these commands:**
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDp6+n/7Sz8wfA5CP5uIFwTBDWvRn0BEuAxS16zkw8E/rIGdqSZlIrZs7wn0PEd522+jh9u4yWy/ZNGUKOh1viraH6BYhUBfYfy88//X7vfKGbFl4+wwYoKGbaSKeAbUQnz8z+lkS4XX0PnN/B7TihMwVm5CexWYRn7zfYyUFQ8nbVwjX9Qm/mVbCWooMbKuyeTxAjMoWg+PFX+5SaNEQA8BJ/xh/oH6v2MYuVj55Hjw2bLGn115rwFaCukbPFiJvFiRvZBKtFJKwY96vrxXHRnqBZpg8AJhDaj6/UFrxmGAAvhFiJQ01MqtJITwvWpjbtVh5NrbJFpc6g2PK7ARWKfafnB6jnvNSCBMl6DFffBuZoRAlLxm4h/sC1tbB2RccnZDp4N22OH/JlC/n11qsH1gV/WLPhexb2CalPpA9joKZkMdd0DFIYfPbxK9aJZ6gkVYowLD46vXqKt/Q66QbxGMReNTqZrkI3CGLt0B/xPEafXbQIsU8fGRQ5dlb4VegK1pBfGL/UQYD37bNzURoTGiTsZTwUpTEzi22Ki+8/mYKtS3+kgmBIdY03C6iuMskTe+dQ1LvtNBQMPyfadEPtNhw2B4T8h+CDoqdAbBrufaJATYy+Zsxl6Ae+5mMkPASmHfBToT3qNBUWGNWHv/VCVgMHXaPSBgyO67XzNWRFg7w== sanket@teknas.com.au" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```

3. **Test connection (should work without password now):**
   ```powershell
   ssh root@77.42.67.166
   ```

## After Adding the Key

Once the key is added, I'll be able to:
- ✅ SSH into the server without password
- ✅ Run the HTTPS setup script automatically
- ✅ Upload files and execute commands remotely

## Verification

After adding the key, test:
```powershell
ssh root@77.42.67.166 "echo 'SSH key works!'"
```

If this works without asking for a password, we're all set! 🎉
