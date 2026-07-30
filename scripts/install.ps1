<#
.SYNOPSIS
ServerPanel Native Windows Installer
.DESCRIPTION
Downloads the latest release from GitHub, sets up directories, permissions, and creates a Windows Service.
#>

$ErrorActionPreference = "Stop"

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-ErrorMsg { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Host "================================================="
Write-Host "   ServerPanel Native Installer (Windows)        "
Write-Host "================================================="

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-Not $isAdmin) {
    Write-ErrorMsg "Please run PowerShell as Administrator."
    Exit 1
}

$InstallDir = "C:\Program Files\ServerPanel"
$DataDir = "C:\ProgramData\ServerPanel"
$Repo = "serverpanel/serverpanel"

Write-Info "Checking Node.js requirement..."
if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Node.js is not installed. Please install Node.js v20+ and try again."
    Exit 1
}

Write-Info "Setting up directories..."
New-Item -ItemType Directory -Force -Path "$DataDir\database" | Out-Null
New-Item -ItemType Directory -Force -Path "$DataDir\apps" | Out-Null
New-Item -ItemType Directory -Force -Path "$DataDir\logs" | Out-Null
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Info "Fetching latest release information from GitHub..."
try {
    $Release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
    $Asset = $Release.assets | Where-Object { $_.name -eq "serverpanel-windows-x64.zip" }
    
    if ($Asset) {
        $DownloadUrl = $Asset.browser_download_url
        $ZipPath = "$env:TEMP\serverpanel.zip"
        
        Write-Info "Downloading ServerPanel from $DownloadUrl..."
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
        
        Write-Info "Extracting files..."
        Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force
        Remove-Item $ZipPath -Force
    } else {
        Write-ErrorMsg "Could not find serverpanel-windows-x64.zip in the latest release."
        throw "Asset not found"
    }
} catch {
    Write-ErrorMsg "Failed to fetch release from GitHub or missing artifacts."
    Write-Info "Simulating local install for development..."
    if (Test-Path ".\dist") {
        Copy-Item -Path ".\dist" -Destination $InstallDir -Recurse -Force
    } else {
        Write-ErrorMsg "No local build found. Exiting."
        Exit 1
    }
}

Write-Info "Configuring Windows Firewall..."
New-NetFirewallRule -DisplayName "ServerPanel Dashboard" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null

Write-Info "Installing NSSM (Non-Sucking Service Manager) for Windows Service..."
$NssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$NssmZip = "$env:TEMP\nssm.zip"
Invoke-WebRequest -Uri $NssmUrl -OutFile $NssmZip
Expand-Archive -Path $NssmZip -DestinationPath "$env:TEMP\nssm_extracted" -Force
$NssmExe = "$env:TEMP\nssm_extracted\nssm-2.24\win64\nssm.exe"

Copy-Item $NssmExe -Destination "$InstallDir\nssm.exe" -Force
Remove-Item $NssmZip -Force
Remove-Item "$env:TEMP\nssm_extracted" -Recurse -Force

Write-Info "Creating Windows Service..."
$ServiceName = "ServerPanel"
$NodeExe = (Get-Command node).Source

if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Stop-Service -Name $ServiceName -Force
    & "$InstallDir\nssm.exe" remove $ServiceName confirm
}

& "$InstallDir\nssm.exe" install $ServiceName $NodeExe "$InstallDir\dist\server.cjs"
& "$InstallDir\nssm.exe" set $ServiceName AppDirectory $InstallDir
& "$InstallDir\nssm.exe" set $ServiceName AppEnvironmentExtra "NODE_ENV=production`nSERVERPANEL_DATA_DIR=$DataDir"
& "$InstallDir\nssm.exe" set $ServiceName Description "ServerPanel Management Interface"
& "$InstallDir\nssm.exe" set $ServiceName Start SERVICE_AUTO_START

Write-Info "Starting ServerPanel service..."
Start-Service -Name $ServiceName

Write-Info "Waiting for ServerPanel web interface to respond..."
$MaxRetries = 15
$RetryCount = 0
$Started = $false

while ($RetryCount -lt $MaxRetries) {
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -ErrorAction Stop
        if ($Response.StatusCode -eq 200) {
            $Started = $true
            break
        }
    } catch {
        # Ignore and retry
    }
    Start-Sleep -Seconds 2
    $RetryCount++
}

if ($Started) {
    Write-Success "Installation completed successfully!"
    Write-Success "ServerPanel is running and responding."
    Write-Success "Access the dashboard at: http://localhost:3000"
} else {
    Write-ErrorMsg "ServerPanel service started, but the web interface is not responding."
    Exit 1
}
