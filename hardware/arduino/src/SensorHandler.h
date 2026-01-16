#ifndef SENSOR_HANDLER_H
#define SENSOR_HANDLER_H

#include <Arduino.h>
#include "ChangeDetector.h"


typedef float (*SensorReadCallback)();

class SensorHandler {
private:
    String _sensorId;
    SensorReadCallback _readCallback;
    ChangeDetector<float> _changeDetector;

public:
    SensorHandler(const String& id, SensorReadCallback callback, float changeThreshold);
    SensorHandler(const String& id, SensorReadCallback callback);

    void update();
    void sendCurrentValue();

    const String& getId() const {
        return _sensorId;
    }
};

#endif