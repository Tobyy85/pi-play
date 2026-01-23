#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#include "SensorTypes.h"


SensorConfig<ThermistorConfig> thermCfg = {
    "temperatureSensor",
    0.5f,
    {
        A0,
        100000.0f,
        100000.0f,
        25.0f,
        3950.0f,
    }
};

SensorConfig<ButtonConfig> reverseSignalCfg = {
    "isReverse",
    0.0f,
    {
        2,
        true,
    }
};

#endif