# Script pour récupérer automatiquement l'App ID Firebase
# Usage: .\get-firebase-app-id.ps1

Write-Host "🔍 Récupération de l'App ID Firebase" -ForegroundColor Cyan
Write-Host ""

# Vérifier Firebase CLI
$firebasePath = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebasePath) {
    Write-Host "❌ Firebase CLI non installé!" -ForegroundColor Red
    Write-Host "💡 Installez-le avec: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Récupérer la liste des apps
Write-Host "📱 Récupération des apps..." -ForegroundColor Yellow

try {
    $appsJson = firebase apps:list --json | ConvertFrom-Json
    
    if (-not $appsJson -or -not $appsJson.result) {
        Write-Host "❌ Aucune app trouvée" -ForegroundColor Red
        Write-Host "💡 Créez une app avec: firebase apps:create ANDROID" -ForegroundColor Yellow
        exit 1
    }
    
    # Filtrer les apps Android
    $androidApps = $appsJson.result | Where-Object { $_.platform -eq "ANDROID" }
    
    if ($androidApps.Count -eq 0) {
        Write-Host "❌ Aucune app Android trouvée" -ForegroundColor Red
        Write-Host "💡 Créez-en une avec: firebase apps:create ANDROID --package-name com.anonymous.appui" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "📱 Apps Android trouvées: $($androidApps.Count)" -ForegroundColor Green
    Write-Host ""
    
    # Afficher toutes les apps Android
    $index = 1
    foreach ($app in $androidApps) {
        Write-Host "[$index] $($app.displayName)" -ForegroundColor Cyan
        Write-Host "    App ID: $($app.appId)" -ForegroundColor White
        Write-Host "    Package: $($app.packageName)" -ForegroundColor Gray
        Write-Host ""
        $index++
    }
    
    # Utiliser la première app
    $selectedApp = $androidApps | Select-Object -First 1
    $APP_ID = $selectedApp.appId
    
    Write-Host "✅ App ID sélectionné: $APP_ID" -ForegroundColor Green
    Write-Host ""
    
    # Mettre à jour firebase.json
    if (Test-Path "firebase.json") {
        Write-Host "📝 Mise à jour de firebase.json..." -ForegroundColor Yellow
        
        try {
            $firebaseJson = Get-Content "firebase.json" | ConvertFrom-Json
            
            if (-not $firebaseJson.appDistribution) {
                $firebaseJson | Add-Member -NotePropertyName "appDistribution" -NotePropertyValue @{
                    app = $APP_ID
                    groups = @("internal-testers")
                }
            } else {
                $firebaseJson.appDistribution.app = $APP_ID
            }
            
            $firebaseJson | ConvertTo-Json -Depth 10 | Set-Content "firebase.json"
            Write-Host "✅ firebase.json mis à jour!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Erreur lors de la mise à jour de firebase.json: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  firebase.json non trouvé, création..." -ForegroundColor Yellow
        
        $newConfig = @{
            appDistribution = @{
                app = $APP_ID
                groups = @("internal-testers")
            }
        }
        
        $newConfig | ConvertTo-Json -Depth 10 | Set-Content "firebase.json"
        Write-Host "✅ firebase.json créé!" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # Mettre à jour le script distribute-apk.ps1
    $distributeScript = "scripts\distribute-apk.ps1"
    if (Test-Path $distributeScript) {
        Write-Host "📝 Mise à jour de distribute-apk.ps1..." -ForegroundColor Yellow
        
        $scriptContent = Get-Content $distributeScript -Raw
        
        # Remplacer la ligne FirebaseAppId
        if ($scriptContent -match '\[string\]\$FirebaseAppId\s*=\s*"[^"]*"') {
            $scriptContent = $scriptContent -replace '(\[string\]\$FirebaseAppId\s*=\s*)"[^"]*"', "`$1`"$APP_ID`""
            Set-Content -Path $distributeScript -Value $scriptContent -NoNewline
            Write-Host "✅ distribute-apk.ps1 mis à jour!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Impossible de trouver la variable FirebaseAppId dans le script" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🔗 Votre Firebase App ID:" -ForegroundColor Yellow
    Write-Host "   $APP_ID" -ForegroundColor White
    Write-Host "════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Fichiers mis à jour:" -ForegroundColor Green
    Write-Host "   ✅ firebase.json" -ForegroundColor White
    Write-Host "   ✅ scripts/distribute-apk.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Prêt à distribuer!" -ForegroundColor Green
    Write-Host "   npm run release" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
}
