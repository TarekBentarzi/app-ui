# Script pour ajouter rapidement des testeurs Firebase
# Usage: .\add-testers.ps1 -Emails "user1@test.com,user2@test.com" [-Group "internal-testers"]

param(
    [Parameter(Mandatory=$true)]
    [string]$Emails,
    [string]$Group = "internal-testers"
)

Write-Host "👥 Ajout de testeurs Firebase" -ForegroundColor Cyan
Write-Host ""

# Séparer les emails
$emailList = $Emails -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

Write-Host "📧 Emails à ajouter: $($emailList.Count)" -ForegroundColor Yellow
foreach ($email in $emailList) {
    Write-Host "   - $email" -ForegroundColor White
}
Write-Host ""
Write-Host "👥 Groupe cible: $Group" -ForegroundColor Yellow
Write-Host ""

# Vérifier Firebase CLI
$firebasePath = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebasePath) {
    Write-Host "❌ Firebase CLI non installé!" -ForegroundColor Red
    exit 1
}

# Ajouter chaque testeur
$successCount = 0
$failCount = 0

foreach ($email in $emailList) {
    Write-Host "➕ Ajout de $email..." -ForegroundColor Cyan
    
    if ($Group) {
        firebase appdistribution:testers:add $email --group $Group 2>&1 | Out-Null
    } else {
        firebase appdistribution:testers:add $email 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $email ajouté avec succès" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ⚠️  $email - déjà existant ou erreur" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "   ✅ Ajoutés: $successCount" -ForegroundColor Green
Write-Host "   ⚠️  Ignorés: $failCount" -ForegroundColor Yellow
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Lister tous les testeurs
Write-Host "📋 Liste complète des testeurs:" -ForegroundColor Yellow
firebase appdistribution:testers:list

Write-Host ""
Write-Host "🚀 Prêt à distribuer! Utilisez:" -ForegroundColor Green
Write-Host "   npm run release" -ForegroundColor White
