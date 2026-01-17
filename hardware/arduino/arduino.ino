#include <Arduino.h>

#include "src/serialCommunication.h"
#include "src/SensorHandler.h"
#include "src/SensorManager.h"

#include "src/sensors/Thermistor.h"

SensorManager sensorManager;

Thermistor thermistor(A0, 100000.0f, 100000.0f, 25.0f, 3950.0f);
float readTemperature() {
    return thermistor.readTemperatureCelsiusAvg(10, 5);
}

SensorHandler tempHandler("temperature", readTemperature, 0.5f);

void setup() {
    SerialCommunication::begin(115200);
    Serial.begin(115200);

    sensorManager.addSensor(&tempHandler);
}

void loop() {
    sensorManager.updateAll();

    sensorManager.checkSerialRequests();
}