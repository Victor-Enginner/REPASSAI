$ErrorActionPreference = 'Stop'
$releaseUrl = 'https://api.github.com/repos/microsoft/devtunnel-cli/releases/latest'
$headers = @{ 'User-Agent' = 'REPASS-AI-Setup' }
$tag = (Invoke-RestMethod -Uri $releaseUrl -Headers $headers -UseBasicParsing).tag_name
Write-Output "Latest devtunnel version: $tag"
$zipUrl = "https://github.com/microsoft/devtunnel-cli/releases/download/$tag/devtunnel-windows-amd64.zip"
Write-Output "Downloading devtunnel from: $zipUrl"
Invoke-WebRequest -Uri $zipUrl -OutFile 'devtunnel.zip' -UseBasicParsing
Expand-Archive -Path 'devtunnel.zip' -DestinationPath 'devtools' -Force
Get-ChildItem 'devtools' | Select-Object Name