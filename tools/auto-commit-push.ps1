$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Publication manuelle active dans $root"
Write-Host "IMAGE = aperçu local uniquement, sans commit ni push."
Write-Host "GOOD = commit et push vers GitHub."
Write-Host "Arret : Ctrl+C"

while ($true) {
  $command = Read-Host 'Commande'
  $command = $command.Trim().ToUpperInvariant()
  if ($command -eq 'IMAGE') {
    $preview = Join-Path $PSScriptRoot 'preview.ps1'
    Start-Process powershell.exe -ArgumentList @(
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $preview
    )
    Start-Process 'http://127.0.0.1:8766/index.html'
    Write-Host 'Aperçu local ouvert sur http://127.0.0.1:8766/index.html'
    Write-Host 'IMAGE ne commit ni ne push aucun fichier.'
    continue
  }
  if ($command -ne 'GOOD') {
    Write-Host "Aucune action. Tape IMAGE pour l'aperçu ou GOOD pour publier."
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
