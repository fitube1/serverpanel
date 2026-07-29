#!/bin/bash
set -e

# ServerPanel Native Linux Installer
# This script handles automated deployment of ServerPanel on Linux systems.

echo "================================================="
echo "   ServerPanel Native Installer (Linux)          "
echo "================================================="

if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run the installer as root (sudo)."
  exit 1
fi

DATA_DIR="/var/lib/serverpanel"
CONF_DIR="/etc/serverpanel"
INSTALL_DIR="/opt/serverpanel"
NODE_VERSION="20"

echo "1. Checking dependencies..."
if ! command -v curl &> /dev/null; then
    apt-get update && apt-get install -y curl || dnf install -y curl || pacman -Sy curl
fi

echo "2. Setting up directories..."
mkdir -p "$DATA_DIR/database" "$DATA_DIR/apps" "$DATA_DIR/logs" "$CONF_DIR" "$INSTALL_DIR"

echo "3. Creating dedicated service user..."
if ! id "serverpanel" &>/dev/null; then
    useradd -r -s /bin/false -d "$DATA_DIR" serverpanel
fi

echo "4. Installing Node.js & Application (Mocked for conceptual demo)..."
# In a real release, this would fetch the compiled .tar.gz from GitHub Releases
# e.g., curl -sL https://github.com/serverpanel/releases/latest/download/serverpanel-linux-x64.tar.gz | tar xz -C $INSTALL_DIR

echo "5. Configuring permissions..."
chown -R serverpanel:serverpanel "$DATA_DIR" "$CONF_DIR" "$INSTALL_DIR"
chmod 700 "$DATA_DIR"

echo "6. Creating systemd service..."
cat > /etc/systemd/system/serverpanel.service <<EOF
[Unit]
Description=ServerPanel Management Interface
After=network.target docker.service

[Service]
Type=simple
User=serverpanel
Group=docker
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=SERVERPANEL_DATA_DIR=$DATA_DIR
Environment=SERVERPANEL_CONF_DIR=$CONF_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/server.cjs
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
# systemctl enable --now serverpanel # Commented out in dev mode

echo "✅ ServerPanel successfully installed!"
echo "Access the dashboard at: http://$(hostname -I | awk '{print $1}'):3000"
