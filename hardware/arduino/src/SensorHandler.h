#ifndef SENSOR_HANDLER_H
#define SENSOR_HANDLER_H

#include <Arduino.h>
#include "ChangeDetector.h"


typedef float (*FloatSensorReadCallback)();
typedef bool (*BoolSensorReadCallback)();

enum class SensorType : uint8_t {
    FLOAT,
    BOOL
};

class SensorHandler {
private:
    String _sensorId;
    union {
        FloatSensorReadCallback floatCallback;
        BoolSensorReadCallback boolCallback;
    } _readCallback;
    SensorType _sensorType;
    ChangeDetector<float> _changeDetector;

public:
    SensorHandler(const String& id, FloatSensorReadCallback callback, float changeThreshold = 0.0f);
    SensorHandler(const String& id, BoolSensorReadCallback callback, float changeThreshold = 0.0f);


    void update();
    void sendCurrentValue();

    const String& getId() const {
        return _sensorId;
    }
};

#endif