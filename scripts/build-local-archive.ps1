$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
$ArchivePath = if ($args.Count -gt 0) { $args[0] } else { Join-Path $RepoRoot "free-naming-agent-local.zip" }

python (Join-Path $ScriptDir "build-local-archive.py") $ArchivePath

Write-Host "Archive created at: $ArchivePath"
