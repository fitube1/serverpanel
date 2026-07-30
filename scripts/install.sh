#!/bin/bash
# ServerPanel Native Linux Installer
# This script handles automated deployment of ServerPanel on Debian/Ubuntu/RHEL/Arch systems.

set -e
set -o pipefail

log_info() { echo -e "\e[34m[INFO]\e[0m $1"; }
log_success() { echo -e "\e[32m[SUCCESS]\e[0m $1"; }
log_error() { echo -e "\e[31m[ERROR]\e[0m $1"; }
log_warn() { echo -e "\e[33m[WARNING]\e[0m $1"; }

trap 'log_error "Installation failed at line $LINENO. Exiting."; exit 1' ERR

echo "================================================="
echo "   ServerPanel Native Installer (Linux)          "
echo "================================================="

if [ "$EUID" -ne 0 ]; then
  log_error "Please run the installer as root (e.g., sudo ./scripts/install.sh)."
  exit 1
fi

# Configuration
DATA_DIR="/var/lib/serverpanel"
CONF_DIR="/etc/serverpanel"
INSTALL_DIR="/opt/serverpanel"
NODE_VERSION="20"
REPO="serverpanel/serverpanel"

log_info "Detecting Operating System..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    log_error "Unsupported OS."
    exit 1
fi

log_info "Detecting Architecture..."
ARCH=$(uname -m)
case $ARCH in
    x86_64) ARCH="x64" ;;
    aarch64) ARCH="arm64" ;;
    *) log_error "Unsupported architecture: $ARCH"; exit 1 ;;
esac

log_info "Installing dependencies (curl, tar)..."
if command -v apt-get &> /dev/null; then
    apt-get update -yqq && apt-get install -yqq curl tar
elif command -v dnf &> /dev/null; then
    dnf install -y curl tar
elif command -v pacman &> /dev/null; then
    pacman -Sy --noconfirm curl tar
fi

log_info "Installing Node.js v${NODE_VERSION}..."
if ! command -v node &> /dev/null || [[ $(node -v) != v${NODE_VERSION}* ]]; then
  if command -v apt-get &> /dev/null; then
      curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
      apt-get install -yqq nodejs
  elif command -v dnf &> /dev/null; then
      curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
      dnf install -y nodejs
  else
      log_warn "Please install Node.js v${NODE_VERSION} manually for your distribution."
  fi
fi
if command -v node &> /dev/null; then
    log_success "Node.js $(node -v) is installed."
else
    log_error "Node.js installation failed or is not available."
    exit 1
fi

log_info "Setting up directories..."
mkdir -p "$DATA_DIR/database" "$DATA_DIR/apps" "$DATA_DIR/logs" "$CONF_DIR" "$INSTALL_DIR"

log_info "Creating dedicated service user 'serverpanel'..."
if ! id "serverpanel" &>/dev/null; then
  useradd -r -s /bin/false -d "$DATA_DIR" serverpanel
fi

log_info "Fetching latest release information from GitHub..."
# Using silent curl to fetch latest release metadata
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" || echo "")
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep "browser_download_url" | grep "serverpanel-linux-x64.tar.gz" | cut -d '"' -f 4 || true)

if [ -z "$DOWNLOAD_URL" ]; then
    log_warn "Could not find a valid release asset for serverpanel-linux-$ARCH.tar.gz."
    log_info "Simulating local installation for development environment..."
    if [ -d "dist" ]; then
        log_info "Local 'dist' directory found. Using local build."
        rm -rf "${INSTALL_DIR:?}/"*
        cp -r dist "$INSTALL_DIR/"
        cp package.json package-lock.json "$INSTALL_DIR/" 2>/dev/null || true
        cd "$INSTALL_DIR"
        npm ci --omit=dev || npm install --omit=dev
    else
        log_error "No local build found and GitHub release not available."
        exit 1
    fi
else
    log_info "Downloading ServerPanel from $DOWNLOAD_URL..."
    curl -L "$DOWNLOAD_URL" -o /tmp/serverpanel.tar.gz
    
    log_info "Extracting files..."
    rm -rf "${INSTALL_DIR:?}/"*
    tar -xzf /tmp/serverpanel.tar.gz -C "$INSTALL_DIR"
    rm /tmp/serverpanel.tar.gz
fi

log_info "Configuring permissions..."
chown -R serverpanel:serverpanel "$DATA_DIR" "$CONF_DIR" "$INSTALL_DIR"
chmod 700 "$DATA_DIR"

log_info "Creating systemd service..."
cat > /etc/systemd/system/serverpanel.service <<EOF
[Unit]
Description=ServerPanel Management Interface
After=network.target docker.service

[Service]
Type=simple
User=serverpanel
Group=serverpanel
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=SERVERPANEL_DATA_DIR=$DATA_DIR
Environment=SERVERPANEL_CONF_DIR=$CONF_DIR
ExecStart=$(command -v node) $INSTALL_DIR/dist/server.cjs
Restart=on-failure
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

log_info "Starting and enabling ServerPanel service..."
systemctl enable serverpanel
systemctl restart serverpanel

log_info "Waiting for ServerPanel web interface to respond..."
MAX_RETRIES=15
RETRY_COUNT=0
STARTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        STARTED=true
        break
    fi
    sleep 2
    ((RETRY_COUNT++))
done

if [ "$STARTED" = true ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
    log_success "Installation completed successfully!"
    log_success "ServerPanel is running and responding."
    log_success "Access the dashboard at: http://$SERVER_IP:3000"
else
    log_error "ServerPanel service started, but the web interface is not responding."
    log_error "Check logs with: journalctl -u serverpanel -n 50"
    exit 1
fi
