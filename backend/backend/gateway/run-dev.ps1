<#
.SYNOPSIS
    Run the Go gateway locally in development mode.

.DESCRIPTION
    Reads JWT_SECRET and GATEWAY_SECRET from the root .env file,
    then starts the gateway pointing at Spring Boot on localhost:8080.

    Spring Boot must already be running before you run this script.
    The gateway will listen on :8443.

.EXAMPLE
    # From the gateway/ directory:
    .\run-dev.ps1

    # From the project root:
    .\gateway\run-dev.ps1
#>

# ── Locate root .env ─────────────────────────────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile   = Join-Path $scriptDir "..\\.env"

if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile — copy .env.example to .env and fill in values."
    exit 1
}

# ── Load .env into the current process environment ───────────────────────────
Get-Content $envFile | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $key   = $parts[0].Trim()
    $value = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
}

# ── Validate the two secrets the gateway needs ────────────────────────────────
$jwtSecret     = [System.Environment]::GetEnvironmentVariable('JWT_SECRET')
$gatewaySecret = [System.Environment]::GetEnvironmentVariable('GATEWAY_SECRET')

if (-not $jwtSecret) {
    Write-Error "JWT_SECRET is not set in .env"
    exit 1
}

if (-not $gatewaySecret) {
    Write-Warning "GATEWAY_SECRET is empty — GatewaySecretFilter in Spring Boot will be DISABLED."
    Write-Warning "This is fine for local dev; just make sure application-dev.yml has gateway.secret: ''"
}

# ── Run ───────────────────────────────────────────────────────────────────────
Write-Host "Starting Go gateway..." -ForegroundColor Cyan
Write-Host "  Backend : http://localhost:8080" -ForegroundColor Gray
Write-Host "  Listen  : :8443" -ForegroundColor Gray
Write-Host ""

$env:BACKEND_URL    = "http://localhost:8080"
$env:PORT           = "8443"
$env:JWT_SECRET     = $jwtSecret
$env:GATEWAY_SECRET = $gatewaySecret

Set-Location $scriptDir
go run ./cmd/gateway

