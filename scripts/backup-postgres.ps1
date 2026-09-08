param([string]$BackupDir = "./backups")
$ErrorActionPreference = "Stop"
if (-not $env:POSTGRES_DB -or -not $env:POSTGRES_USER -or -not $env:POSTGRES_PASSWORD) { throw "POSTGRES_DB, POSTGRES_USER and POSTGRES_PASSWORD are required" }
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp=(Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$env:PGPASSWORD=$env:POSTGRES_PASSWORD
$out=Join-Path $BackupDir "nabha_$stamp.dump"
& pg_dump --format=custom --no-owner --no-acl --host ($env:POSTGRES_HOST ?? "localhost") --port ($env:POSTGRES_PORT ?? "5432") --username $env:POSTGRES_USER --dbname $env:POSTGRES_DB --file $out
Remove-Item Env:PGPASSWORD
Write-Host "Backup created: $out"
