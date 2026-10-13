$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Publication manuelle active dans $root"
Write-Host "Enregistre tes fichiers, puis tape GOOD et appuie sur Entree pour publier."
Write-Host "Arret : Ctrl+C"

while ($true) {
  $command = Read-Host 'Commande'
  if ($command.Trim().ToUpperInvariant() -ne 'GOOD') {
    Write-Host "Aucune publication. Tape GOOD pour confirmer."
    continue
  }

  $status = (& git status --porcelain) -join "`n"
  if (-not $status) {
    Write-Host 'Aucune modification a publier.'
    continue
  }

  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  git add -A
  git commit -m "Publication manuelle $stamp" -m "Commit cree apres confirmation GOOD." -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
  if ($LASTEXITCODE -ne 0) {
    Write-Warning 'Le commit a echoue. Les modifications restent locales.'
    continue
  }

  git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Warning 'Le push a echoue. Le commit local est conserve.'
  } else {
    Write-Host "Publie : $stamp"
  }
}
