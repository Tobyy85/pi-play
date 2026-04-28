#include "Photoresistor.h"


Photoresistor::Photoresistor(uint8_t pin) {
    _pin = pin;
    pinMode(_pin, INPUT);
}

int Photoresistor::readRawADC() {
    return analogRead(_pin);
}

int Photoresistor::readPercentage() {
    int adcValue = readRawADC();
    return (100UL * adcValue) / 1023;
}


int Photoresistor::readPercentageAvg(uint8_t samples, uint16_t delayMs) {
    long total = 0;
    for (uint8_t i = 0; i < samples; i++) {
        total += readRawADC();
        delay(delayMs);
    }
    int avgAdc = total / samples;
    return (100UL * avgAdc) / 1023;
}