param(
  [int]$IntervalSeconds = 5
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Auto-commit actif dans $root"
Write-Host "Arret : Ctrl+C"

$lastStatus = ''
while ($true) {
  $status = (& git status --porcelain) -join "`n"
  if ($status -and $status -ne $lastStatus) {
    Start-Sleep -Seconds $IntervalSeconds
    $status = (& git status --porcelain) -join "`n"
    if ($status) {
      $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
      git add -A
      git commit -m "Sauvegarde automatique $stamp" -m "Commit cree automatiquement apres une modification locale." -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
      if ($LASTEXITCODE -ne 0) {
        Write-Warning 'Le commit automatique a echoue. Nouvelle tentative au prochain changement.'
      } else {
        git push origin main
        if ($LASTEXITCODE -ne 0) {
          Write-Warning 'Le push automatique a echoue. Le commit local est conserve.'
        } else {
          Write-Host "Publie : $stamp"
        }
      }
    }
  }
  $lastStatus = $status
  Start-Sleep -Seconds $IntervalSeconds
}
