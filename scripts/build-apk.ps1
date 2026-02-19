# Script pour builder l'APK Android
# Usage: .\build-apk.ps1

Write-Host "🏗️  Building Android APK..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidPath = Join-Path $projectRoot "android"

# Vérifier que le dossier Android existe
if (-not (Test-Path $androidPath)) {
    Write-Host "❌ Dossier android/ non trouvé!" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier android
Push-Location $androidPath

try {
    Write-Host "📦 Nettoyage du build précédent..." -ForegroundColor Yellow
    & .\gradlew.bat clean
    
    Write-Host "🔨 Compilation de l'APK..." -ForegroundColor Yellow
    & .\gradlew.bat assembleRelease
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    
    if (Test-Path $apkPath) {
        $apkFullPath = Join-Path $androidPath $apkPath
        $fileSize = (Get-Item $apkFullPath).Length / 1MB
        
        Write-Host ""
        Write-Host "✅ APK créé avec succès!" -ForegroundColor Green
        Write-Host "📍 Chemin: $apkFullPath" -ForegroundColor Cyan
        Write-Host "📊 Taille: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Prochaine étape: Distribuer l'APK avec:" -ForegroundColor Yellow
        Write-Host "   npm run distribute" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Échec de la création de l'APK" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors du build: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
