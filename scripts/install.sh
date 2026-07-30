#!/bin/bash
# ServerPanel Native Linux Installer
# This script handles automated deployment of ServerPanel on Debian/Ubuntu systems.

set -e
set -o pipefail

log_info() { echo -e "\e[34m[INFO]\e[0m $1"; }
log_success() { echo -e "\e[32m[SUCCESS]\e[0m $1"; }
log_error() { echo -e "\e[31m[ERROR]\e[0m $1"; }

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
REPO_URL="https://github.com/serverpanel/serverpanel.git" # Placeholder for open-source URL

log_info "Updating package lists..."
apt-get update -yqq

log_info "Installing system dependencies (curl, git, build-essential)..."
apt-get install -yqq curl git build-essential

log_info "Installing Node.js v${NODE_VERSION}..."
if ! command -v node &> /dev/null || [[ $(node -v) != v${NODE_VERSION}* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -yqq nodejs
fi
log_success "Node.js $(node -v) is installed."

log_info "Setting up directories..."
mkdir -p "$DATA_DIR/database" "$DATA_DIR/apps" "$DATA_DIR/logs" "$CONF_DIR" "$INSTALL_DIR"

log_info "Creating dedicated service user 'serverpanel'..."
if ! id "serverpanel" &>/dev/null; then
  useradd -r -s /bin/false -d "$DATA_DIR" serverpanel
fi

log_info "Acquiring source code..."
BUILD_DIR=$(mktemp -d)

if [ -f "package.json" ] && grep -q "ServerPanel" "package.json" 2>/dev/null || [ -f "src/server/index.ts" ]; then
  log_info "Local source code detected. Building from current directory..."
  cp -r . "$BUILD_DIR"
else
  log_info "Cloning repository from $REPO_URL..."
  # If this fails because the repo doesn't exist yet, the script will exit due to set -e
  git clone "$REPO_URL" "$BUILD_DIR"
fi

cd "$BUILD_DIR"

log_info "Installing NPM dependencies..."
npm ci

log_info "Compiling the project..."
npm run build

log_info "Deploying compiled artifacts to $INSTALL_DIR..."
rm -rf "${INSTALL_DIR:?}/"*
cp -r dist "$INSTALL_DIR/"
cp package.json package-lock.json "$INSTALL_DIR/"

cd "$INSTALL_DIR"
log_info "Installing production dependencies in deployment directory..."
npm ci --omit=dev

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
ExecStart=/usr/bin/node $INSTALL_DIR/dist/server.cjs
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

log_info "Validating service status..."
sleep 3
if ! systemctl is-active --quiet serverpanel; then
  log_error "ServerPanel service failed to start! Check logs with: journalctl -u serverpanel -n 50"
  exit 1
fi

# Clean up build dir
rm -rf "$BUILD_DIR"

SERVER_IP=$(hostname -I | awk '{print $1}')
log_success "ServerPanel successfully installed and running!"
log_success "Access the dashboard at: http://$SERVER_IP:3000"
