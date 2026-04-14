#include <Arduino.h>

#include "volumeEncoder.h"
#include "sensors.h"

#include "src/SerialCommunication.h"


void setup() {
    SerialCommunication::begin(115200);

    beginVolumeEncoder();
    beginSensors();
}

void loop() {
    sendVolumeUpdate();
    checkVolumeEncoderButton();

    updateSensors();
}