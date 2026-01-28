# Pi-Play

An Electron application for Raspberry Pi that integrates with Arduino hardware for sensor monitoring and control.

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup guide
- [Architecture](./docs/architecture.md) - Project structure and design overview
- [Configuration](./docs/configuration.md) - Hardware configuration
- [Arduino Communication](./docs/arduino-communication.md) - Serial protocol and data flow
- [Sensor Configuration](./docs/sensor-configuration.md) - Adding new sensors
- [Adding Apps](./docs/adding-apps.md) - How to create new applications

## Tech Stack

### Application

- **[Electron](https://www.electronjs.org/)** - Cross-platform desktop application
- **[React](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Development

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[electron-builder](https://www.electron.build/)** - Electron application packaging

## Quick Start

```bash
# Clone repository
git clone https://github.com/Tobyy85/pi-play.git
cd pi-play

# Install dependencies
cd app
npm install

# Start development
npm run dev
```

> See [Getting Started](./docs/getting-started.md) for detailed setup instructions.

---

## Project Structure

```
pi-play/
├── app/                  # Electron application
│   └── src/
│       ├── main/         # Main process (Node.js)
│       ├── renderer/     # Renderer process (React)
│       └── shared/       # Shared code (between main and renderer)
├── docs/                 # Documentation
└── hardware/
    └── arduino/          # Arduino firmware
```

> See [Architecture](./docs/architecture.md) for more details on the project structure and design.
