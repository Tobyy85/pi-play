#include <Arduino.h>

#include "serialCommunication.h"



void SerialCommunication::begin(unsigned long baudRate) {
    Serial.begin(baudRate);
}

void SerialCommunication::sendJson(String type, String value) {
    Serial.println("{\"type\":\"" + type + "\",\"value\":\"" + value + "\"}");
}