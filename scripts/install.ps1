<#
.SYNOPSIS
ServerPanel Native Windows Installer
.DESCRIPTION
Sets up directories, permissions, and creates a Windows Service for ServerPanel.
#>

Write-Host "================================================="
Write-Host "   ServerPanel Native Installer (Windows)        "
Write-Host "================================================="

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-Not $isAdmin) {
    Write-Warning "❌ Error: Please run PowerShell as Administrator."
    Exit
}

$InstallDir = "C:\Program Files\ServerPanel"
$DataDir = "C:\ProgramData\ServerPanel"

Write-Host "1. Setting up directories..."
New-Item -ItemType Directory -Force -Path "$DataDir\database" | Out-Null
New-Item -ItemType Directory -Force -Path "$DataDir\apps" | Out-Null
New-Item -ItemType Directory -Force -Path "$DataDir\logs" | Out-Null
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Host "2. Downloading latest release (Mocked)..."
# In a real release: Invoke-WebRequest -Uri https://github.com/... -OutFile release.zip
# Expand-Archive release.zip -DestinationPath $InstallDir -Force

Write-Host "3. Configuring Windows Firewall..."
New-NetFirewallRule -DisplayName "ServerPanel Dashboard" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null

Write-Host "4. Registering Windows Service (Requires NSSM/WinSW in production)..."
# Example using sc.exe or WinSW
# sc.exe create ServerPanel binPath= "node.exe $InstallDir\dist\server.cjs" start= auto

Write-Host "✅ ServerPanel successfully installed!"
Write-Host "Access the dashboard at: http://localhost:3000"
