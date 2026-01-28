# Configuration Guide

This guide explains how to configure hardware connections for Pi-Play.

## Arduino Configuration

The Arduino configuration is located in `app/src/shared/config/arduino.ts`:

```typescript
export const ARDUINO_CONFIG: ArduinoConfig = {
    boardInfo: {
        vendorId: '1A86',
        productId: '7523',
    },
    baudRate: 115200,
}
```

### Finding vendorId and productId

The `vendorId` and `productId` are unique identifiers for your Arduino board's USB interface. These values are used to automatically detect and connect to the correct serial port.

You can use the serialport package to list devices:

```bash
npx @serialport/list
```

This will output something like:

```bash
# Windows
COM3    USB\VID_1A86&PID_7523\5&242A2F40

# Linux
/dev/ttyUSB0    1A86    7523    USB2.0-Serial
```

### Baud Rate

The `baudRate` must match the value used in the ARDUINO_CONFIG:

```cpp
// In arduino.ino
void setup() {
    SerialCommunication::begin(115200);
}
```

## Camera Configuration

The camera configuration is located in `app/src/shared/config/camera.ts`:

```typescript
export const CAMERA_CONFIG: CameraConfig = {
    reverseCameraId: '1fd215033257ce2031f75ef2193545b2465b8efff9e3f7d50bd69f8cbe5205a2',
}
```

### Finding the Camera deviceId

The `deviceId` is a unique identifier for each camera device. To find available cameras:

1. Open your application (`npm run dev`)
2. Open DevTools (`F12`)
3. Run in Console:

```javascript
navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.filter(device => device.kind === 'videoinput').forEach(device => console.log(device))
})
```

> **Note:** Camera permissions must be granted before `deviceId` values are populated.

### Multiple Cameras

If you have multiple cameras, the `deviceId` helps select the correct one. The ID remains consistent as long as the camera is connected to the same USB port.
