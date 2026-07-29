# ServerPanel

**Modern, universal server management platform.**

ServerPanel is a professional, open-source dashboard that brings a unified web interface to manage your infrastructure, inspired by industry standards like TrueNAS, Proxmox, and Cockpit. It sits on top of your existing Operating System—without taking it over—giving you clean, powerful administrative access.

## Features

- **Universal Compatibility**: Works natively on Debian, Ubuntu, RHEL, Arch, and Windows Server.
- **Docker First**: Complete container management, image registries, and a built-in compose-based App Store.
- **Live System Metrics**: Real-time CPU, RAM, Disk, and Network monitoring.
- **Secure Architecture**: Role-based access, comprehensive audit logs, and distinct separation of application logic and user data.
- **Web Terminal**: Instant, authenticated WebSocket terminal access directly to your host.

## Installation

ServerPanel is designed to be installed in seconds.

### Linux (Native)
```bash
curl -fsSL https://raw.githubusercontent.com/serverpanel/serverpanel/main/scripts/install.sh | sudo bash
```

### Windows (Native)
Run in an Administrative PowerShell:
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/serverpanel/serverpanel/main/scripts/install.ps1 -OutFile install.ps1; .\install.ps1
```

### Docker
```yaml
version: '3.8'
services:
  serverpanel:
    image: ghcr.io/serverpanel/serverpanel:latest
    container_name: serverpanel
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - serverpanel_data:/data
      - /var/run/docker.sock:/var/run/docker.sock
```

## Documentation
Please refer to the `/docs` directory for advanced configuration, plugin development, and security models.

## License
MIT License
