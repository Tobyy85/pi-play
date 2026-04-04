#ifndef ULTRASONICSENSOR_H
#define ULTRASONICSENSOR_H

#include <Arduino.h>


class UltrasonicSensor {
public:
    UltrasonicSensor(int8_t triggerPin, int8_t echoPin);
    float UltrasonicSensor::getDistance();

private:
    int8_t _triggerPin;
    int8_t _echoPin;
};
#endif