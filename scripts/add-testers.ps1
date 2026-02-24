# Script pour ajouter rapidement des testeurs Firebase
# Usage: .\add-testers.ps1 -Emails "user1@test.com,user2@test.com" [-Group "internal-testers"]

param(
    [Parameter(Mandatory=$true)]
    [string]$Emails,
    [string]$Group = "internal-testers"
)

Write-Host "[Firebase] Ajout de testeurs" -ForegroundColor Cyan
Write-Host ""

# Separer les emails
$emailList = $Emails -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

Write-Host "Emails a ajouter: $($emailList.Count)" -ForegroundColor Yellow
foreach ($email in $emailList) {
    Write-Host "   - $email" -ForegroundColor White
}
Write-Host ""
Write-Host "Groupe cible: $Group" -ForegroundColor Yellow
Write-Host ""

# Verifier Firebase CLI
$firebasePath = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebasePath) {
    Write-Host "[ERROR] Firebase CLI non installe!" -ForegroundColor Red
    exit 1
}

# Ajouter chaque testeur
$successCount = 0
$failCount = 0

foreach ($email in $emailList) {
    Write-Host "[+] Ajout de $email..." -ForegroundColor Cyan
    
    if ($Group) {
        firebase appdistribution:testers:add $email --group $Group 2>&1 | Out-Null
    } else {
        firebase appdistribution:testers:add $email 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] $email ajoute avec succes" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   [WARN] $email - deja existant ou erreur" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "   Ajoutes: $successCount" -ForegroundColor Green
Write-Host "   Ignores: $failCount" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Lister tous les testeurs
Write-Host "Liste complete des testeurs:" -ForegroundColor Yellow
firebase appdistribution:testers:list

Write-Host ""
Write-Host "[SUCCESS] Pret a distribuer! Utilisez: npm run release" -ForegroundColor Green
