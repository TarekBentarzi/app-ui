# Script pour builder l'APK Android
# Usage: .\build-apk.ps1

Write-Host "[Build] Android APK..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidPath = Join-Path $projectRoot "android"

# Verifier que le dossier Android existe
if (-not (Test-Path $androidPath)) {
    Write-Host "[ERREUR] Dossier android/ non trouve!" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier android
Push-Location $androidPath

try {
    Write-Host "[Clean] Nettoyage du build precedent..." -ForegroundColor Yellow
    & .\gradlew.bat clean
    
    Write-Host "[Build] Compilation de l'APK..." -ForegroundColor Yellow
    & .\gradlew.bat assembleRelease
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    
    if (Test-Path $apkPath) {
        $apkFullPath = Join-Path $androidPath $apkPath
        $fileSize = (Get-Item $apkFullPath).Length / 1MB
        
        Write-Host ""
        Write-Host "[SUCCESS] APK cree avec succes!" -ForegroundColor Green
        Write-Host "[Path] Chemin: $apkFullPath" -ForegroundColor Cyan
        Write-Host "[Size] Taille: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[Next] Prochaine etape: Distribuer l'APK avec:" -ForegroundColor Yellow
        Write-Host "   npm run distribute" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "[ERREUR] Echec de la creation de l'APK" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERREUR] Erreur lors du build: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
