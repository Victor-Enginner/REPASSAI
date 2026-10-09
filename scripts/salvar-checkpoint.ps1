$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskDir = Join-Path $taskRoot ('backups/checkpoint-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $taskDir | Out-Null
Push-Location $taskRoot
try {
  git bundle create (Join-Path $taskDir 'historico.bundle') --all
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao salvar histórico Git.' }
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $taskZipPath = Join-Path $taskDir 'projeto-atual.zip'
  $taskZip = [IO.Compression.ZipFile]::Open($taskZipPath, [IO.Compression.ZipArchiveMode]::Create)
  $taskCount = 0
  try {
    $taskFiles = git -c core.quotepath=false ls-files --cached --others --exclude-standard
    foreach ($taskFile in ($taskFiles | Sort-Object -Unique)) {
      if ($taskFile -match '(^|/)(\.env[^/]*|\.git|\.netlify|\.release-worktrees|backups|node_modules|\.venv|venv|__pycache__)(/|$)' -or $taskFile -match '^backend/(data|logs)/' -or $taskFile -match '(?i)(api[-_]?key|credentials|secret|\.pem$|\.key$|\.sqlite|\.db$)') { continue }
      $taskAbsolute = [IO.Path]::GetFullPath((Join-Path $taskRoot $taskFile))
      if (!$taskAbsolute.StartsWith($taskRoot + [IO.Path]::DirectorySeparatorChar) -or !(Test-Path -LiteralPath $taskAbsolute -PathType Leaf)) { continue }
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskZip, $taskAbsolute, $taskFile, [IO.Compression.CompressionLevel]::Fastest) | Out-Null
      $taskCount++
    }
  } finally { $taskZip.Dispose() }
  git bundle verify (Join-Path $taskDir 'historico.bundle')
  if ($LASTEXITCODE -ne 0) { throw 'Histórico inválido.' }
  $taskCheck = [IO.Compression.ZipFile]::OpenRead($taskZipPath)
  try { if ($taskCheck.Entries.Count -ne $taskCount -or !$taskCheck.GetEntry('src/components/Sidebar.jsx')) { throw 'Checkpoint incompleto.' } }
  finally { $taskCheck.Dispose() }
  @{
    created = (Get-Date).ToString('o'); files = $taskCount; commit = (git rev-parse HEAD)
    zip_sha256 = (Get-FileHash $taskZipPath -Algorithm SHA256).Hash
    excludes = 'Dependências, caches, segredos, worktrees e dados runtime. Supabase e configurações dos provedores não estão neste backup.'
  } | ConvertTo-Json | Set-Content (Join-Path $taskDir 'manifesto.json') -Encoding utf8
  Write-Output "CHECKPOINT_OK $taskDir ($taskCount arquivos)"
} finally { Pop-Location }
