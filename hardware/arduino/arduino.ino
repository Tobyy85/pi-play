#include <Arduino.h>

#include "volumeEncoder.h"
#include "sensors.h"
#include "engineDetector.h"

#include "src/SerialCommunication.h"


void setup() {
    SerialCommunication::begin(115200);

    beginVolumeEncoder();
    beginEngineDetector();
    beginSensors();
}

void loop() {
    sendVolumeUpdate();
    checkVolumeEncoderButton();
    sendEngineDetectorUpdate();

    updateSensors();
}