# TSUSwap Setup Script for Windows PowerShell

Write-Host "🚀 Setting up TSUSwap..." -ForegroundColor Cyan

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js is installed ($nodeVersion)" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your actual values before continuing" -ForegroundColor Yellow
    exit 0
}

Write-Host "✅ .env file exists" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Push database schema
Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema created" -ForegroundColor Green

# Seed database (optional)
$seed = Read-Host "Would you like to seed the database with sample data? (y/n)"
if ($seed -eq 'y' -or $seed -eq 'Y') {
    Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
    npx tsx prisma/seed.ts
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Failed to seed database (optional step)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Database seeded" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server, run:"
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open http://localhost:3000 in your browser"
Write-Host ""
Write-Host "Sample credentials (if seeded):"
Write-Host "  Email: john@tsu.edu"
Write-Host "  Password: password123"
Write-Host ""





