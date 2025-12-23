# Usage:
#   powershell -ExecutionPolicy Bypass -File backend/scripts/run-local.ps1 `
#     -MongoUri "mongodb+srv://user:pass@cluster.mongodb.net/datapokemon?retryWrites=true&w=majority" `
#     -JwtSecret "your_secret" `
#     -Port 5000
param(
  [string]$MongoUri = $env:MONGODB_URI,
  [string]$JwtSecret = $env:JWT_SECRET,
  [int]$Port = 5000
)

if (-not $MongoUri) { Write-Error "Missing MongoUri (set -MongoUri or env MONGODB_URI)"; exit 1 }
if (-not $JwtSecret) { Write-Error "Missing JwtSecret (set -JwtSecret or env JWT_SECRET)"; exit 1 }

Set-Location $PSScriptRoot\..
$env:MONGODB_URI = $MongoUri
$env:JWT_SECRET = $JwtSecret
$env:PORT = $Port

npm install
npm start
