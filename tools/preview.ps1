$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$port = 8766
$prefix = "http://127.0.0.1:$port/"
$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()

function Get-Version {
  $latest = Get-ChildItem -LiteralPath $public -Recurse -File |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
  if ($null -eq $latest) { return '0' }
  return $latest.LastWriteTimeUtc.Ticks.ToString()
}

function Get-ContentType([string]$path) {
  switch ([IO.Path]::GetExtension($path).ToLowerInvariant()) {
    '.html' { return 'text/html; charset=utf-8' }
    '.css' { return 'text/css; charset=utf-8' }
    '.js' { return 'text/javascript; charset=utf-8' }
    '.json' { return 'application/json; charset=utf-8' }
    '.png' { return 'image/png' }
    '.jpg' { return 'image/jpeg' }
    '.jpeg' { return 'image/jpeg' }
    '.svg' { return 'image/svg+xml' }
    default { return 'application/octet-stream' }
  }
}

function Write-Response($response, [byte[]]$bytes, [string]$contentType) {
  $response.ContentType = $contentType
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
  $response.Close()
}

$reloadScript = @'
<script>
(function () {
  const initialVersion = '__PREVIEW_VERSION__';
  let version = initialVersion;
  setInterval(async function () {
    try {
      const response = await fetch('/__preview_version', {cache: 'no-store'});
      const nextVersion = await response.text();
      if (version !== nextVersion) location.reload();
    } catch (_) {}
  }, 1000);
})();
</script>
'@

Write-Host "Aperçu local actif : $prefix"
Write-Host "Arrêt : Ctrl+C"
try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
    if ($requestPath -eq '/__preview_version') {
      $bytes = [Text.Encoding]::UTF8.GetBytes((Get-Version))
      Write-Response $context.Response $bytes 'text/plain; charset=utf-8'
      continue
    }

    $relative = $requestPath.TrimStart('/').Replace('/', '\')
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
    $file = Join-Path $public $relative
    $fullPublic = [IO.Path]::GetFullPath($public)
    $fullFile = [IO.Path]::GetFullPath($file)
    if (-not $fullFile.StartsWith($fullPublic + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $fullFile -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $context.Response.Close()
      continue
    }

    $contentType = Get-ContentType $fullFile
    if ($contentType.StartsWith('text/html')) {
      $html = [IO.File]::ReadAllText($fullFile)
      $html = $html.Replace('</body>', ($reloadScript.Replace('__PREVIEW_VERSION__', (Get-Version)) + '</body>'))
      $bytes = [Text.Encoding]::UTF8.GetBytes($html)
    } else {
      $bytes = [IO.File]::ReadAllBytes($fullFile)
    }
    Write-Response $context.Response $bytes $contentType
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
