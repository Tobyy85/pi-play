#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Arduino.h>
#include "SensorHandler.h"

#define MAX_SENSORS 10

class SensorManager {
private:
    SensorHandler* _sensors[MAX_SENSORS];
    uint8_t sensorCount = 0;

public:

    bool addSensor(SensorHandler* sensor);
    void updateAll();

    void handleRequest(const String& requestedId);
    void checkSerialRequests();

};

#endif