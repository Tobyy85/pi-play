#include <Arduino.h>

#include "serialCommunication.h"



void SerialCommunication::begin(unsigned long baudRate) {
    Serial.begin(baudRate);
}

void SerialCommunication::sendJson(String sensorId, String value) {
    Serial.println("{\"sensorId\":\"" + sensorId + "\",\"value\":\"" + value + "\"}");
}