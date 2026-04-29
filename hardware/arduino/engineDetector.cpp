#include "sensorConfigs.h"


namespace {
    bool lastState = false;
}


void beginEngineDetector() {
    pinMode(engineDetectorCfg.detectionPin, INPUT);
    pinMode(engineDetectorCfg.pinOn, OUTPUT);
    pinMode(engineDetectorCfg.pinOff, OUTPUT);
    digitalWrite(engineDetectorCfg.pinOn, LOW);
    digitalWrite(engineDetectorCfg.pinOff, LOW);
}

void sendEngineDetectorUpdate() {
    bool currentState = digitalRead(engineDetectorCfg.detectionPin);
    if (currentState == lastState) return;

    int pin = currentState ? engineDetectorCfg.pinOn : engineDetectorCfg.pinOff;
    digitalWrite(pin, HIGH);
    delay(20);
    digitalWrite(pin, LOW);

    lastState = currentState;
}