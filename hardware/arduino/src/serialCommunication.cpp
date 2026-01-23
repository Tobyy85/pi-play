#include <Arduino.h>

#include "serialCommunication.h"



void SerialCommunication::begin(unsigned long baudRate) {
    Serial.begin(baudRate);
}

void SerialCommunication::sendJson(String sensorId, float value) {
    Serial.println("{\"sensorId\":\"" + sensorId + "\",\"value\":" + value + "}");
}

void SerialCommunication::sendJson(String sensorId, bool value) {
    Serial.println("{\"sensorId\":\"" + sensorId + "\",\"value\":" + (value ? "true" : "false") + "}");
}