# Architecture Overview

Pi-Play is an Electron application that communicates with Arduino hardware. The architecture follows a clean separation of concerns between the main process, renderer process, and shared code.

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        Electron App                           │
│  ┌──────────────────────┐       ┌──────────────────────────┐  │
│  │    Main Process      │  IPC  │    Renderer Process      │  │
│  │    (Node.js)         │◄─────►│    (React/Browser)       │  │
│  └──────────┬───────────┘       └─────────────┬────────────┘  │
│             │                                 │               │
│  ┌──────────┴───────────┐                     │               │
│  │       Shared         │─────────────────────┘               │
│  └──────────────────────┘                                     │
└───────────────────────────────────────────────────────────────┘
              │
              │ Serial (USB)
              ▼
┌───────────────────────────────────────────────────────────────┐
│                         Arduino                               │
└───────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
app/src/
├── main/                       # Main Process
│   ├── main.ts                 # Entry point
│   ├── preload.ts              # Preload script (IPC bridge)
│   ├── managers/
│   ├── services/
│   └── utils/
│
├── renderer/                   # Renderer Process
│   ├── main.tsx                # React entry point
│   ├── features/               # Feature modules (bulletproof)
│   ├── routes/                 # Router configuration
│   └── styles/                 # Global styles
│
└── shared/                     # Shared Code
    ├── config/                 # Configuration files
    └── types/                  # TypeScript types
```

## Main Process

The main process runs in Node.js and has access to system APIs.

## Renderer Process

The renderer process runs in a Chromium browser context with React.

The renderer follows a feature-based architecture (inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react)):

## Hardware (Arduino)

The Arduino firmware handles sensor management and serial communication.

#### `SensorManager`

Central manager for all sensors:

- Registers and updates all sensors
- Handles serial requests from Electron
- Coordinates automatic change detection

#### `SensorHandler`

Individual sensor wrapper:

- Wraps sensor read callbacks
- Implements change detection
- Sends data via `SerialCommunication`

#### `SerialCommunication`

JSON-based serial protocol:

- Sends sensor data as JSON
- Format: `{"sensorId":"<id>","value":<value>}`

See [Arduino Communication](./arduino-communication.md) for detailed protocol documentation.
