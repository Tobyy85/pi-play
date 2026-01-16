#include "SensorHandler.h"

#include "serialCommunication.h"


SensorHandler::SensorHandler(const String& id, SensorReadCallback callback, float changeThreshold)
    : _sensorId(id),
    _readCallback(callback),
    _changeDetector(changeThreshold) {
}

SensorHandler::SensorHandler(const String& id, SensorReadCallback callback)
    : _sensorId(id),
    _readCallback(callback),
    _changeDetector(0.0f) {
}

void SensorHandler::update() {
    float value = _readCallback();

    if (isnan(value)) return;

    if (_changeDetector.hasChanged(value)) {
        SerialCommunication::sendJson(_sensorId, String(value, 2));
    }
}

void SensorHandler::sendCurrentValue() {
    float value = _readCallback();
    if (!isnan(value)) {
        SerialCommunication::sendJson(_sensorId, String(value, 2));
    }
}