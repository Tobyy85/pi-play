/**
 * Volume Encoder
 * Sends 1.0f for clockwise rotation, -1.0f for counterclockwise rotation, and 0.0f when the button is pressed.
 */

#include "src/serialCommunication.h"

const uint8_t pinA = 3;
const uint8_t pinB = 2;
const uint8_t pinButton = 4;
const char* encoderId = "volumeEncoder";

bool lastButtonState = false;

void beginVolumeEncoder() {
    pinMode(pinA, INPUT_PULLUP);
    pinMode(pinB, INPUT);
    pinMode(pinButton, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(pinA), sendVolumeUpdate, RISING);

    lastButtonState = digitalRead(pinButton);
}


void sendVolumeUpdate() {
    int b = digitalRead(pinB);
    SerialCommunication::sendJson(encoderId, b ? -1.0f : 1.0f);
}

void checkVolumeEncoderButton() {
    const bool buttonValue = digitalRead(pinButton);
    if (!buttonValue && lastButtonState) {
        SerialCommunication::sendJson(encoderId, 0.0f);
    }
    lastButtonState = buttonValue;
}