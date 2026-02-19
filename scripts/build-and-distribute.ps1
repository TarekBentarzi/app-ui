# Script combiné: Build + Distribute en une seule commande
# Usage: .\build-and-distribute.ps1 [-ReleaseNotes "Message"] [-FirebaseAppId "1:123:android:abc"]

param(
    [string]$ReleaseNotes = "Nouvelle version de test - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [string]$Groups = "internal-testers",
    [string]$FirebaseAppId = "",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Build & Distribute APK" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host ""

$scriptDir = $PSScriptRoot

# Étape 1: Build APK
if (-not $SkipBuild) {
    Write-Host "📍 Étape 1/2: Build APK" -ForegroundColor Cyan
    Write-Host ""
    
    & "$scriptDir\build-apk.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Build échoué, arrêt du processus" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "⏳ Pause de 2 secondes..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Write-Host ""
} else {
    Write-Host "⏭️  Build ignoré (option -SkipBuild activée)" -ForegroundColor Yellow
    Write-Host ""
}

# Étape 2: Distribute
Write-Host "📍 Étape 2/2: Distribution Firebase" -ForegroundColor Cyan
Write-Host ""

$distributeParams = @{
    ReleaseNotes = $ReleaseNotes
    Groups = $Groups
}

if ($FirebaseAppId) {
    $distributeParams.FirebaseAppId = $FirebaseAppId
}

& "$scriptDir\distribute-apk.ps1" @distributeParams

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Distribution échouée" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Processus terminé avec succès!" -ForegroundColor Green
