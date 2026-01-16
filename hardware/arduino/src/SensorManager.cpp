#include "SensorManager.h"


bool SensorManager::addSensor(SensorHandler* sensor) {
    if (sensorCount >= MAX_SENSORS) return false;
    _sensors[sensorCount++] = sensor;
    return true;
}

void SensorManager::updateAll() {
    for (uint8_t i = 0; i < sensorCount; i++) {
        _sensors[i]->update();
    }
}


void SensorManager::handleRequest(const String& requestedId) {
    for (uint8_t i = 0; i < sensorCount; i++) {
        if (_sensors[i]->getId() == requestedId) {
            _sensors[i]->sendCurrentValue();
            return;
        }
    }
}

void SensorManager::checkSerialRequests() {
    if (Serial.available() > 0) {
        String request = Serial.readStringUntil('\n');
        request.trim();
        if (request.length() > 0) {
            handleRequest(request);
        }
    }
}