# Script d'initialisation Firebase complète - 100% CLI
# Usage: .\firebase-setup.ps1 [-ProjectId "qlearn-app"]

param(
    [string]$ProjectId = "qlearn-app",
    [string]$DisplayName = "QLearN Mobile App",
    [string]$PackageName = "com.anonymous.appui",
    [string]$AppName = "QLearN Android"
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "🔥 Firebase Setup - 100% CLI" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host ""

# Vérifier si Firebase CLI est installé
$firebasePath = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebasePath) {
    Write-Host "❌ Firebase CLI non installé!" -ForegroundColor Red
    Write-Host "💡 Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI détecté: $($firebasePath.Version)" -ForegroundColor Green
Write-Host ""

# Vérifier l'authentification
Write-Host "🔐 Vérification de l'authentification..." -ForegroundColor Cyan
$loginCheck = firebase login:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Non authentifié" -ForegroundColor Yellow
    Write-Host "🔑 Connexion à Firebase..." -ForegroundColor Cyan
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Échec de la connexion" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Authentification OK" -ForegroundColor Green
Write-Host ""

# Étape 1: Créer le projet (ou utiliser existant)
Write-Host "📦 Étape 1/7: Création du projet Firebase" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId" -ForegroundColor White

# Vérifier si le projet existe déjà
$existingProjects = firebase projects:list --json 2>$null | ConvertFrom-Json
$projectExists = $existingProjects.result | Where-Object { $_.projectId -eq $ProjectId }

if ($projectExists) {
    Write-Host "   ⚠️  Projet déjà existant, utilisation du projet existant" -ForegroundColor Yellow
} else {
    Write-Host "   Création en cours..." -ForegroundColor Yellow
    firebase projects:create $ProjectId --display-name "$DisplayName" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Erreur lors de la création (peut-être déjà existant)" -ForegroundColor Yellow
        Write-Host "   💡 Essayez un autre Project ID ou utilisez un existant" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Projets disponibles:" -ForegroundColor Cyan
        firebase projects:list
        $ProjectId = Read-Host "   Entrez le Project ID à utiliser"
    } else {
        Write-Host "   ✅ Projet créé avec succès!" -ForegroundColor Green
    }
}
Write-Host ""

# Étape 2: Activer le projet
Write-Host "🔧 Étape 2/7: Activation du projet" -ForegroundColor Cyan
firebase use $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Impossible d'activer le projet" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Projet activé" -ForegroundColor Green
Write-Host ""

# Étape 3: Créer l'app Android (ou utiliser existante)
Write-Host "📱 Étape 3/7: Création de l'app Android" -ForegroundColor Cyan
Write-Host "   Package: $PackageName" -ForegroundColor White

# Vérifier si l'app existe déjà
$existingApps = firebase apps:list --json 2>$null | ConvertFrom-Json
$androidApp = $existingApps.result | Where-Object { $_.platform -eq "ANDROID" -and $_.packageName -eq $PackageName } | Select-Object -First 1

if ($androidApp) {
    Write-Host "   ⚠️  App Android déjà existante" -ForegroundColor Yellow
    $APP_ID = $androidApp.appId
    Write-Host "   App ID: $APP_ID" -ForegroundColor Cyan
} else {
    Write-Host "   Création de l'app..." -ForegroundColor Yellow
    $createOutput = firebase apps:create ANDROID --display-name "$AppName" --package-name "$PackageName" 2>&1 | Out-String
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erreur lors de la création de l'app" -ForegroundColor Red
        Write-Host $createOutput
        exit 1
    }
    
    # Récupérer l'App ID
    Start-Sleep -Seconds 2
    $apps = firebase apps:list --json 2>$null | ConvertFrom-Json
    $androidApp = $apps.result | Where-Object { $_.platform -eq "ANDROID" } | Select-Object -First 1
    $APP_ID = $androidApp.appId
    
    Write-Host "   ✅ App créée avec succès!" -ForegroundColor Green
    Write-Host "   App ID: $APP_ID" -ForegroundColor Cyan
}
Write-Host ""

# Étape 4: Télécharger google-services.json
Write-Host "📥 Étape 4/7: Téléchargement de google-services.json" -ForegroundColor Cyan
$googleServicesPath = "android\app\google-services.json"
$googleServicesDir = Split-Path $googleServicesPath -Parent

if (-not (Test-Path $googleServicesDir)) {
    New-Item -ItemType Directory -Path $googleServicesDir -Force | Out-Null
}

firebase apps:sdkconfig ANDROID --out $googleServicesPath 2>&1
if ($LASTEXITCODE -eq 0 -and (Test-Path $googleServicesPath)) {
    Write-Host "✅ google-services.json téléchargé" -ForegroundColor Green
    Write-Host "   Emplacement: $googleServicesPath" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Impossible de télécharger google-services.json" -ForegroundColor Yellow
    Write-Host "💡 Vous pouvez le télécharger manuellement depuis la console Firebase" -ForegroundColor Cyan
}
Write-Host ""

# Étape 5: Mettre à jour firebase.json
Write-Host "📝 Étape 5/7: Configuration de firebase.json" -ForegroundColor Cyan

$firebaseJsonContent = @{
    appDistribution = @{
        app = $APP_ID
        groups = @("internal-testers")
    }
}

$firebaseJsonContent | ConvertTo-Json -Depth 10 | Set-Content -Path "firebase.json"
Write-Host "✅ firebase.json créé/mis à jour" -ForegroundColor Green
Write-Host ""

# Étape 6: Créer les groupes de testeurs
Write-Host "👥 Étape 6/7: Création des groupes de testeurs" -ForegroundColor Cyan

$groups = @("internal-testers", "beta-testers")
foreach ($group in $groups) {
    Write-Host "   Création du groupe: $group" -ForegroundColor Yellow
    firebase appdistribution:group:create $group 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Groupe '$group' créé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Groupe '$group' existe déjà ou erreur" -ForegroundColor Yellow
    }
}
Write-Host ""

# Étape 7: Mettre à jour le script de distribution
Write-Host "🔧 Étape 7/7: Configuration du script de distribution" -ForegroundColor Cyan

$distributeScriptPath = "scripts\distribute-apk.ps1"
if (Test-Path $distributeScriptPath) {
    $scriptContent = Get-Content $distributeScriptPath -Raw
    $scriptContent = $scriptContent -replace '\[string\]\$FirebaseAppId = ""', "[string]`$FirebaseAppId = `"$APP_ID`""
    Set-Content -Path $distributeScriptPath -Value $scriptContent
    Write-Host "✅ Script distribute-apk.ps1 mis à jour avec l'App ID" -ForegroundColor Green
} else {
    Write-Host "⚠️  Script distribute-apk.ps1 non trouvé" -ForegroundColor Yellow
}
Write-Host ""

# Résumé
Write-Host "════════════════════════════════════" -ForegroundColor Magenta
Write-Host "🎉 Configuration Firebase terminée!" -ForegroundColor Green
Write-Host "════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "📋 Informations importantes:" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId" -ForegroundColor White
Write-Host "   App ID: $APP_ID" -ForegroundColor White
Write-Host "   Package: $PackageName" -ForegroundColor White
Write-Host ""
Write-Host "📁 Fichiers créés/mis à jour:" -ForegroundColor Cyan
Write-Host "   ✅ firebase.json" -ForegroundColor White
Write-Host "   ✅ .firebaserc" -ForegroundColor White
Write-Host "   ✅ android/app/google-services.json" -ForegroundColor White
Write-Host "   ✅ scripts/distribute-apk.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Ajouter des testeurs:" -ForegroundColor Cyan
Write-Host "   firebase appdistribution:testers:add testeur@example.com --group internal-testers" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Configurer Gradle (si pas déjà fait):" -ForegroundColor Cyan
Write-Host "   - Ajouter le plugin Google Services dans android/build.gradle" -ForegroundColor White
Write-Host "   - Voir: FIREBASE_APP_DISTRIBUTION.md section 2.3" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Build et distribuer:" -ForegroundColor Cyan
Write-Host "   npm run build:apk" -ForegroundColor White
Write-Host "   npm run distribute" -ForegroundColor White
Write-Host ""
Write-Host "   Ou en une seule commande:" -ForegroundColor Cyan
Write-Host "   npm run release" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Liens utiles:" -ForegroundColor Yellow
Write-Host "   Console Firebase: https://console.firebase.google.com/project/$ProjectId" -ForegroundColor White
Write-Host "   App Distribution: https://console.firebase.google.com/project/$ProjectId/appdistribution" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "   Guide CLI complet: FIREBASE_CLI_SETUP.md" -ForegroundColor White
Write-Host "   Guide détaillé: FIREBASE_APP_DISTRIBUTION.md" -ForegroundColor White
Write-Host "   Quick Start: FIREBASE_QUICK_START.md" -ForegroundColor White
Write-Host ""
