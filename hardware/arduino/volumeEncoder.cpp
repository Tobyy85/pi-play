#include "src/SerialCommunication.h"
#include "sensorConfigs.h"


namespace {
    bool lastButtonState = false;
    volatile int8_t encoderDelta = 0;

    unsigned long lastUpdateMillis = 0;
}


void updateEncoderDelta() {
    unsigned long now = millis();

    if (digitalRead(volumeEncoderCfg.hw.pinA) && now - lastUpdateMillis >= 5) {
        if (digitalRead(volumeEncoderCfg.hw.pinB)) {
            encoderDelta++;
        } else {
            encoderDelta--;
        }
        lastUpdateMillis = now;
    }
}

void beginVolumeEncoder() {
    pinMode(volumeEncoderCfg.hw.pinA, INPUT_PULLUP);
    pinMode(volumeEncoderCfg.hw.pinB, INPUT_PULLUP);
    pinMode(volumeEncoderCfg.hw.pinButton, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(volumeEncoderCfg.hw.pinA), updateEncoderDelta, RISING);

    lastButtonState = digitalRead(volumeEncoderCfg.hw.pinButton);
}

void sendVolumeUpdate() {
    int8_t delta;

    noInterrupts();
    delta = encoderDelta;
    encoderDelta = 0;
    interrupts();

    if (delta != 0) {
        SerialCommunication::sendJson(volumeEncoderCfg.id, delta > 0 ? 1.0f : -1.0f);
    }
}

void checkVolumeEncoderButton() {
    const bool buttonValue = digitalRead(volumeEncoderCfg.hw.pinButton);
    if (!buttonValue && lastButtonState) {
        SerialCommunication::sendJson(volumeEncoderCfg.id, 0.0f);
    }
    lastButtonState = buttonValue;
}