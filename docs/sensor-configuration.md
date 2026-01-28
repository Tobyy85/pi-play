# Sensor Configuration

This guide explains how to add new sensors to the Pi-Play system.

## Overview

Adding a new sensor involves changes in both Arduino firmware and (optionally) the Electron app:

1. **Arduino Side:**
    - Define sensor type in `SensorTypes.h` (if new hardware type)
    - Configure sensor in `SensorConfigs.h`
    - Initialize and register in `arduino.ino`
    - (Optional) Create sensor class in `src/sensors/`

2. **Electron Side:**
    - Add sensor ID constant
    - Use `useArduinoSensor` hook in components

## Arduino Configuration

### Step 1: Define Hardware Type (if needed)

If your sensor requires a new hardware configuration structure, add it to `SensorTypes.h`:

```cpp
// hardware/arduino/SensorTypes.h

struct MySensorConfig
{
    uint8_t pin;
};
```

### Step 2: Configure Sensor Instance

Add your sensor configuration to `SensorConfigs.h`:

```cpp
// hardware/arduino/SensorConfigs.h

#include "SensorTypes.h"

SensorConfig<MySensorConfig> mySensorCfg = {
    "mySensorId",        // Unique sensor ID (must match Electron side)
    0.1f,                // Change threshold (minimum change to trigger update)
    {                    // Hardware-specific settings
        A1,
    }
};
```

### Step 3: Initialize in Main Sketch

Update `arduino.ino` to initialize and register your sensor:

```cpp
// hardware/arduino/arduino.ino

#include "src/sensors/MySensor.h"  // If using custom sensor class

// Initialize sensor hardware
MySensor mySensor(mySensorCfg.hw.pin);

// Create read function
float readMySensor() {
    return mySensor.read();
}

// Create sensor handler
SensorHandler mySensorHandler(mySensorCfg.id, readMySensor, mySensorCfg.changeThreshold);

void setup() {
    SerialCommunication::begin(115200);

    // Register with manager
    sensorManager.addSensor(&mySensorHandler);
}
```

## Electron Configuration

### Step 1: Add Sensor ID Constant

Add your sensor ID to the constants file:

```typescript
// app/src/renderer/features/arduino/constants/arduinoSensorIds.ts

export const MY_SENSOR_ID = 'mySensorId' // Must match Arduino config
```

### Step 2: Use in Components

```tsx
import useArduinoSensor from '@renderer/features/arduino/hooks/useArduinoSensor'
import { MY_SENSOR_ID } from '@renderer/features/arduino/constants/arduinoSensorIds'

function MySensorDisplay() {
    const { value, isLoading, error, refresh } = useArduinoSensor<number>(MY_SENSOR_ID)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <span>Sensor Value: {value}</span>
            <button onClick={refresh}>Refresh</button>
        </div>
    )
}
```

## Configuration Summary

| File                  | Purpose                                |
| --------------------- | -------------------------------------- |
| `SensorTypes.h`       | Hardware configuration structures      |
| `SensorConfigs.h`     | Sensor instance configurations         |
| `arduino.ino`         | Sensor initialization and registration |
| `src/sensors/*.cpp`   | Sensor driver implementations          |
| `arduinoSensorIds.ts` | Sensor ID constants (Electron)         |
