#include <Arduino.h>

#include "src/serialCommunication.h"
#include "src/ChangeDetector.h"

#include "src/sensors/Thermistor.h"

Thermistor thermistor(A0, 100000.0f, 100000.0f, 25.0f, 3950.0f);
ChangeDetector<float> thermistorChangeDetector(0.5f);



void setup() {
    SerialCommunication::begin(115200);
    Serial.begin(115200);
}

void loop() {
    float temperatureC = thermistor.readTemperatureCelsiusAvg(10, 5);
    if (!isnan(temperatureC) && thermistorChangeDetector.hasChanged(temperatureC)) {
        SerialCommunication::sendJson("temperature", String(temperatureC, 2));
    }
}