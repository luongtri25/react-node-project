# Prereq: npm install -g @railway/cli; railway login
# Usage:
#   powershell -ExecutionPolicy Bypass -File backend/scripts/railway-deploy.ps1 `
#     -MongoUri "mongodb+srv://user:pass@cluster.mongodb.net/datapokemon?retryWrites=true&w=majority" `
#     -JwtSecret "your_secret"
param(
  [string]$MongoUri,
  [string]$JwtSecret,
  [int]$Port = 5000
)

if (-not $MongoUri) { Write-Error "Missing MongoUri. Provide -MongoUri"; exit 1 }
if (-not $JwtSecret) { Write-Error "Missing JwtSecret. Provide -JwtSecret"; exit 1 }

Set-Location $PSScriptRoot\..

# Build frontend to serve from backend
Push-Location ..\frontend
npm install
npm run build
Pop-Location

# Install backend deps
npm install

# Set Railway variables and deploy
railway variables set MONGODB_URI=$MongoUri JWT_SECRET=$JwtSecret PORT=$Port
railway up
