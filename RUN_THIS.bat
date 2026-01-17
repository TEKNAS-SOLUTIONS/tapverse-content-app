@echo off
echo Uploading and running setup script on server...
echo.
echo You will be prompted for your SSH password
echo.

scp setup-all.sh root@77.42.67.166:/root/setup-all.sh
if %errorlevel% neq 0 (
    echo.
    echo Upload failed. Please check:
    echo 1. SSH key is set up, OR
    echo 2. You know the root password
    echo.
    pause
    exit /b 1
)

echo.
echo Script uploaded. Now executing on server...
echo You will be prompted for your SSH password again
echo.

ssh root@77.42.67.166 "chmod +x /root/setup-all.sh && bash /root/setup-all.sh"

pause
