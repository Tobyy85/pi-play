#include <Arduino.h>

#include "volumeEncoder.h"
#include "sensors.h"

#include "src/serialCommunication.h"


void setup() {
    SerialCommunication::begin(115200);

    beginVolumeEncoder();
    beginSensors();
}

void loop() {
    checkVolumeEncoderButton();
    updateSensors();
}