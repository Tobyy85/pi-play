#ifndef PHOTORESISTOR_H
#define PHOTORESISTOR_H

#include <Arduino.h>


class Photoresistor {
public:
    Photoresistor(uint8_t pin);
    int readRawADC();
    int readPercentage();
    int readPercentageAvg(uint8_t samples = 10, uint16_t delayMs = 5);

private:
    uint8_t _pin;
};
#endif