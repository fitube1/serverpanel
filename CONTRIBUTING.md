# Contributing to ServerPanel

Thank you for your interest in improving ServerPanel! We want to make this platform the standard for server management, and your contributions are essential.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Architecture Guidelines

- **Single Source of Truth**: Never duplicate backend logic for different deployment methods (Docker vs Native). Features must work across platforms by using the Adapter pattern located in `src/server/adapters/`.
- **Data Persistence**: Never write data to the application's root directory. Always read the `SERVERPANEL_DATA_DIR` environment variable to determine where to store databases, configuration files, and apps.
- **UI/UX Standard**: ServerPanel is a professional tool. Avoid "vibe coding" UI traits (neon glows, excessive animations, gradients). Rely on clean, high-contrast, informative dashboards using Tailwind CSS and shadcn/ui.

## Pull Request Process

1. Ensure your code follows the existing style (`npm run lint`).
2. Update the README.md or `/docs` with details of changes to the interface or architecture.
3. Your PR will be reviewed for security and architectural compliance before merging.
