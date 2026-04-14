#include "SensorHandler.h"
#include "SerialCommunication.h"

SensorHandler::SensorHandler(const String& id, FloatSensorReadCallback callback, float changeThreshold)
    : _sensorId(id),
    _sensorType(SensorType::FLOAT),
    _changeDetector(changeThreshold) {
    _readCallback.floatCallback = callback;
}

SensorHandler::SensorHandler(const String& id, BoolSensorReadCallback callback, float changeThreshold)
    : _sensorId(id),
    _sensorType(SensorType::BOOL),
    _changeDetector(changeThreshold) {
    _readCallback.boolCallback = callback;
}

void SensorHandler::update() {
    if (_sensorType == SensorType::FLOAT) {
        float value = _readCallback.floatCallback();
        if (isnan(value)) return;
        if (_changeDetector.hasChanged(value)) {
            SerialCommunication::sendJson(_sensorId, value);
        }
    } else {
        bool value = _readCallback.boolCallback();
        float floatValue = value ? 1.0f : 0.0f;
        if (_changeDetector.hasChanged(floatValue)) {
            SerialCommunication::sendJson(_sensorId, value);
        }
    }
}

void SensorHandler::sendCurrentValue() {
    if (_sensorType == SensorType::FLOAT) {
        float value = _readCallback.floatCallback();
        if (!isnan(value)) {
            SerialCommunication::sendJson(_sensorId, value);
        }
    } else {
        bool value = _readCallback.boolCallback();
        SerialCommunication::sendJson(_sensorId, value);
    }
}