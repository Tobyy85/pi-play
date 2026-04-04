#include "UltrasonicSensor.h"


UltrasonicSensor::UltrasonicSensor(int8_t triggerPin, int8_t echoPin) : _triggerPin(triggerPin), _echoPin(echoPin) {
    pinMode(triggerPin, OUTPUT);
    pinMode(echoPin, INPUT);
}

float UltrasonicSensor::getDistance() {
    digitalWrite(_triggerPin, LOW);
    delayMicroseconds(2);
    digitalWrite(_triggerPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(_triggerPin, LOW);

    float duration = pulseIn(_echoPin, HIGH);
    float distance = (duration * .0343) / 2;


    return distance;
}