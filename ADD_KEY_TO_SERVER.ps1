# PowerShell script to add SSH key to server
# Run this script: .\ADD_KEY_TO_SERVER.ps1

$pubkey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "`nAdding SSH key to server..." -ForegroundColor Green
Write-Host "You will be prompted for the root password`n" -ForegroundColor Yellow

# Escape the public key for PowerShell
$escapedKey = $pubkey -replace "'", "''" -replace '"', '`"'

# Command to add key to server
$command = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$escapedKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH key added successfully!'"

# Execute SSH command
ssh root@77.42.67.166 $command

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SSH key added successfully!`n" -ForegroundColor Green
    Write-Host "Testing connection..." -ForegroundColor Cyan
    ssh -o BatchMode=yes root@77.42.67.166 "echo 'Connection works!'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 SSH setup complete! You can now connect without password.`n" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Key added but connection test failed. Please try manually:`n" -ForegroundColor Yellow
        Write-Host "ssh root@77.42.67.166`n" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n❌ Failed to add SSH key. Please add it manually.`n" -ForegroundColor Red
    Write-Host "Your public key:" -ForegroundColor Yellow
    Write-Host $pubkey -ForegroundColor White
    Write-Host "`nAdd it to server manually using:" -ForegroundColor Yellow
    Write-Host "ssh root@77.42.67.166" -ForegroundColor Cyan
    Write-Host "Then on server run:" -ForegroundColor Yellow
    Write-Host "echo '$pubkey' >> ~/.ssh/authorized_keys" -ForegroundColor White
}
