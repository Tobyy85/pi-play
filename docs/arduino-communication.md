# Arduino Communication

This document describes how data flows between Arduino and the Electron application.

## Overview

```
┌──────────────────┐          Serial (USB)         ┌──────────────────┐
│     Arduino      │ ◄───────────────────────────► │     Electron     │
│                  │        JSON over Serial       │                  │
│  SensorManager   │                               │  ArduinoService  │
│  SensorHandler   │                               │  preload.ts      │
│  SerialComm      │                               │  useArduinoSensor│
└──────────────────┘                               └──────────────────┘
```

## Data Format

All communication uses JSON format over serial:

```json
{ "sensorId": "temperatureSensor", "value": 23.5 }
```

### ArduinoData Type (TypeScript)

```typescript
interface ArduinoData {
    sensorId: string
    value: number | boolean
}
```

## Sending Data from Arduino

### Using SerialCommunication

The `SerialCommunication` class provides static methods for sending JSON data:

```cpp
#include "src/serialCommunication.h"

// Send float value
SerialCommunication::sendJson("temperatureSensor", 23.5f);
// Output: {"sensorId":"temperatureSensor","value":23.50}

// Send boolean value
SerialCommunication::sendJson("reverseSignal", true);
// Output: {"sensorId":"reverseSignal","value":true}
```

### Automatic Sending via SensorHandler

The recommended approach is using `SensorHandler` and adding it to `SensorManager` which automatically:

- Detects value changes
- Sends data only when threshold is exceeded

```cpp
// In arduino.ino
#include "src/SensorHandler.h"
#include "src/SensorManager.h"

SensorManager sensorManager;

SensorHandler tempHandler("temperatureSensor", readTemperature, 0.5f);

void setup() {
    sensorManager.addSensor(&tempHandler); // Register sensor
}

void loop() {
    sensorManager.updateAll();  // Automatically sends if changed
    sensorManager.checkSerialRequests(); // Handle incoming requests
}
```

## Receiving Data in Electron

### Automatic Updates (Push)

When Arduino sends data automatically (via change detection), the Electron app receives it through event listeners.

#### In Main Process (ArduinoService)

```typescript
// arduinoService.ts
this.parser.on('data', (line: string) => {
    const data = this.parseJson(line) as ArduinoData | null
    if (data) {
        // Broadcast to renderer
        this.window.webContents.send('arduino:change', data)
    }
})
```

#### In Renderer (React Hook)

Use the `useArduinoSensor` hook to subscribe to sensor updates:

```tsx
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'
import { TEMPERATURE_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'

function TemperatureDisplay() {
    const { value, isLoading, error } = useArduinoSensor<number>(TEMPERATURE_SENSOR_ID)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return <div>Temperature: {value}°C</div>
}
```

### Manual Request (Pull)

You can request sensor values on-demand from the renderer:

#### In Renderer

```typescript
// Using the hook's refresh function
const { value, refresh } = useArduinoSensor<number>('temperatureSensor')

// Manually request fresh value
await refresh()

// Or directly via API
const data = await window.api.arduino.requestSensorValue('temperatureSensor')
console.log(data.value)
```

#### In Arduino

The `SensorManager` handles incoming requests automatically:

```cpp
void loop() {
    sensorManager.updateAll();
    sensorManager.checkSerialRequests();  // Handles incoming requests
}
```

When a request comes in, `SensorManager.handleRequest()` finds the matching sensor and calls `sendCurrentValue()` on its handler.

## Arduino Components

### SensorManager

Central coordinator for all sensors:

```cpp
SensorManager sensorManager;

void setup() {
    sensorManager.addSensor(&tempHandler);
    sensorManager.addSensor(&reverseHandler);
}

void loop() {
    sensorManager.updateAll();        // Update all sensors, send changes
    sensorManager.checkSerialRequests(); // Handle requests from Electron
}
```

**Key Methods:**

- `addSensor(SensorHandler*)` - Register a sensor
- `updateAll()` - Check all sensors for changes
- `checkSerialRequests()` - Read and handle serial requests

### SensorHandler

Wrapper for individual sensors with change detection:

```cpp
// Float sensor with 0.5 threshold
SensorHandler tempHandler("temperatureSensor", readTemperature, 0.5f);

// Boolean sensor (threshold ignored for booleans)
SensorHandler buttonHandler("isPressed", readButton, 0.0f);
```

**Key Methods:**

- `update()` - Check for changes and send if threshold exceeded
- `sendCurrentValue()` - Force send current value

The `SensorHandler` and `SensorManager` handle all the complexity automatically. You just need to:

1. Create a read function for your sensor
2. Create a `SensorHandler` with the function
3. Add it to the `SensorManager`

## IPC Channels

| Channel                      | Direction       | Description          |
| ---------------------------- | --------------- | -------------------- |
| `arduino:change`             | Main → Renderer | Sensor value changed |
| `arduino:requestSensorValue` | Renderer → Main | Request sensor value |
