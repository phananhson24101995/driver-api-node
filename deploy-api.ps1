$ErrorActionPreference = "Stop"

function Check-ExitCode($Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE"
    }
}

Write-Host "1. Build NestJS..."
npm run build
Check-ExitCode "Build"

Write-Host "2. Upload files to VPS..."
scp -r dist package.json package-lock.json .env.production deploy@160.250.65.164:/var/www/booking-dat-prod/api/
Check-ExitCode "Upload files"

Write-Host "3. Install dependencies and restart API..."
ssh deploy@160.250.65.164 "cd /var/www/booking-dat-prod/api && npm install --omit=dev && (NODE_ENV=production pm2 restart booking-dat-prod-api --update-env || NODE_ENV=production pm2 start dist/main.js --name booking-dat-prod-api)"
Check-ExitCode "Restart API"

Write-Host ""
Write-Host "======================================"
Write-Host " Deploy API completed successfully"
Write-Host "======================================"
