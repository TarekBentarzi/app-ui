# Script rapide après création du projet sur console Firebase
# Lance ce script après avoir créé le projet sur https://console.firebase.google.com/

Write-Host "🔥 Configuration Firebase après création console" -ForegroundColor Cyan
Write-Host ""

# Lister les projets
Write-Host "📋 Vos projets Firebase:" -ForegroundColor Yellow
firebase projects:list

Write-Host ""
$projectId = Read-Host "Entrez le Project ID affiché ci-dessus"

if (-not $projectId) {
    Write-Host "❌ Project ID requis!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Configuration en cours..." -ForegroundColor Cyan
Write-Host ""

# Activer le projet
Write-Host "1/6 Activation du projet..." -ForegroundColor Yellow
firebase use $projectId

# Créer l'app Android
Write-Host "2/6 Création de l'app Android..." -ForegroundColor Yellow
firebase apps:create ANDROID --package-name "com.anonymous.appui"

# Attendre que l'app soit créée
Start-Sleep -Seconds 3

# Télécharger google-services.json
Write-Host "3/6 Téléchargement de google-services.json..." -ForegroundColor Yellow
firebase apps:sdkconfig ANDROID --out android/app/google-services.json

# Récupérer et configurer l'App ID
Write-Host "4/6 Configuration de l'App ID..." -ForegroundColor Yellow
npm run firebase:get-app-id

# Créer le groupe de testeurs
Write-Host "5/6 Création du groupe de testeurs..." -ForegroundColor Yellow
firebase appdistribution:group:create internal-testers

# Résumé
Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "6/6 Ajoutez des testeurs:" -ForegroundColor Yellow
Write-Host "   firebase appdistribution:testers:add votre-email@gmail.com --group internal-testers" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Puis distribuez:" -ForegroundColor Cyan
Write-Host "   npm run release" -ForegroundColor White
Write-Host ""
