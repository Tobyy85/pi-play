#ifndef SENSOR_TYPES_H
#define SENSOR_TYPES_H

#include <Arduino.h>

template <typename T>
struct SensorConfig {
    String id;
    float changeThreshold;
    T hw;
};

struct ThermistorConfig {
    uint8_t pin;
    float seriesResistor;
    float nominalResistance;
    float nominalTemperature;
    float bCoefficient;
};

struct ButtonConfig
{
    uint8_t pin;
    bool inputPullup;
};


#endif