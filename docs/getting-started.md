# Getting Started

This guide will help you set up and run the Pi-Play project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Arduino IDE](https://www.arduino.cc/en/software/#ide)
- Arduino board

## Project Structure

```
pi-play/
├── app/                    # Electron application
│   └── src/
│       ├── main/           # Main process (Node.js/Electron)
│       ├── renderer/       # Renderer process (React)
│       └── shared/         # Shared code between processes
├── docs/                   # Documentation
└── hardware/
    └── arduino/            # Arduino firmware
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Tobyy85/pi-play.git
cd pi-play
```

### 2. Install Dependencies

```bash
cd app
npm install
```

### 3. Configure Hardware

<!-- Before running the application, you need to configure your hardware settings. See [Configuration Guide](./configuration.md) for details on:

- Setting up Arduino connection (vendorId, productId)
- Configuring camera device (deviceId) -->

Before running the application, you need to configure:

- Your hardware settings. See [Configuration Guide](./configuration.md) for more details.
- Your sensors in `SensorConfigs.h`. See [Sensor Configuration](./sensor-configuration.md) for details.

### 4. Upload Arduino Code

1. Open `hardware/arduino/arduino.ino` in Arduino IDE
2. Select your board type (e.g., Arduino Uno, Arduino Mega)
3. Select the correct COM port
4. Click "Upload" to flash the firmware

### 5. Run the Application

```bash
npm run dev
```

This command will:

- Build the Electron main process
- Start Vite development server for the renderer
- Launch the Electron application with hot-reload

## Available Scripts

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start development environment      |
| `npm run dist`   | Build and package for distribution |
| `npm run lint`   | Run ESLint                         |
| `npm run format` | Format code with Prettier          |
