# Script combine: Build + Distribute en une seule commande
# Usage: .\build-and-distribute.ps1 [-ReleaseNotes "Message"] [-FirebaseAppId "1:123:android:abc"]

param(
    [string]$ReleaseNotes = "Nouvelle version de test - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [string]$Groups = "internal-testers",
    [string]$FirebaseAppId = "",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

Write-Host "[Release] Build & Distribute APK" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host ""

$scriptDir = $PSScriptRoot

# Etape 1: Build APK
if (-not $SkipBuild) {
    Write-Host "[Step 1/2] Build APK" -ForegroundColor Cyan
    Write-Host ""
    
    & "$scriptDir\build-apk.ps1"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERREUR] Build echoue, arret du processus" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[Wait] Pause de 2 secondes..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Write-Host ""
} else {
    Write-Host "[Skip] Build ignore (option -SkipBuild activee)" -ForegroundColor Yellow
    Write-Host ""
}

# Etape 2: Distribute
Write-Host "[Step 2/2] Distribution Firebase" -ForegroundColor Cyan
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
    Write-Host "[ERREUR] Distribution echouee" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Processus termine avec succes!" -ForegroundColor Green
