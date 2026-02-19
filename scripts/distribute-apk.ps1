# Script pour distribuer l'APK via Firebase App Distribution
# Usage: .\distribute-apk.ps1 [-ReleaseNotes "Message"] [-Testers "email1@test.com,email2@test.com"] [-Groups "internal-testers"]

param(
    [string]$ReleaseNotes = "Nouvelle version de test - $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    [string]$Testers = "",
    [string]$Groups = "internal-testers",
    [string]$FirebaseAppId = "1:857220913868:android:63c68315ba232f0dd44069"
)

Write-Host "[Distribution] APK vers Firebase App Distribution" -ForegroundColor Cyan
Write-Host ""

# Chemin de l'APK
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"

# Verifier si l'APK existe
if (-not (Test-Path $apkPath)) {
    Write-Host "[ERREUR] APK non trouve: $apkPath" -ForegroundColor Red
    Write-Host "[INFO] Lancez d'abord: npm run build:apk" -ForegroundColor Yellow
    exit 1
}

# Verifier si Firebase CLI est installe
$firebasePath = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebasePath) {
    Write-Host "[ERREUR] Firebase CLI non installe!" -ForegroundColor Red
    Write-Host "[INFO] Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Verifier l'authentification Firebase
Write-Host "[CHECK] Verification de l'authentification Firebase..." -ForegroundColor Yellow
$loginCheck = firebase login:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Non authentifie avec Firebase!" -ForegroundColor Red
    Write-Host "[INFO] Connectez-vous avec: firebase login" -ForegroundColor Yellow
    exit 1
}

# Verifier si l'App ID est fourni
if (-not $FirebaseAppId) {
    Write-Host "[WARN] Firebase App ID non fourni!" -ForegroundColor Yellow
    Write-Host "[INFO] Recuperez votre App ID avec: firebase apps:list" -ForegroundColor Cyan
    Write-Host "[INFO] Ou configurez-le dans ce script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[LIST] Apps Firebase disponibles:" -ForegroundColor Yellow
    firebase apps:list
    Write-Host ""
    $FirebaseAppId = Read-Host "Entrez votre Firebase App ID"
    
    if (-not $FirebaseAppId) {
        Write-Host "[ERREUR] App ID requis pour continuer!" -ForegroundColor Red
        exit 1
    }
}

# Construire la commande Firebase
$firebaseCmd = "firebase appdistribution:distribute `"$apkPath`" --app `"$FirebaseAppId`""

# Ajouter les notes de version
$firebaseCmd += " --release-notes `"$ReleaseNotes`""

# Ajouter les testeurs ou groupes
if ($Testers) {
    Write-Host "[TESTERS] Distribution aux testeurs: $Testers" -ForegroundColor Cyan
    $firebaseCmd += " --testers `"$Testers`""
} elseif ($Groups) {
    Write-Host "[GROUPS] Distribution au groupe: $Groups" -ForegroundColor Cyan
    $firebaseCmd += " --groups `"$Groups`""
}

# Afficher les details
$apkSize = (Get-Item $apkPath).Length / 1MB
$apkSizeRounded = [math]::Round($apkSize, 2)
Write-Host ""
Write-Host "[APK] $apkPath ($apkSizeRounded MB)" -ForegroundColor White
Write-Host "[NOTES] $ReleaseNotes" -ForegroundColor White
Write-Host ""

# Executer la distribution
Write-Host "[UPLOAD] Upload en cours..." -ForegroundColor Yellow
Write-Host ""

try {
    Invoke-Expression $firebaseCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] APK distribue avec succes!" -ForegroundColor Green
        Write-Host "[EMAIL] Les testeurs vont recevoir un email avec le lien d'installation" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[CONSOLE] Voir dans Firebase Console:" -ForegroundColor Yellow
        Write-Host "   https://console.firebase.google.com/project/_/appdistribution" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "[ERREUR] Echec de la distribution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERREUR] Erreur lors de la distribution: $_" -ForegroundColor Red
    exit 1
}
