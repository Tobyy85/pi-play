#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#include "SensorTypes.h"


SensorConfig<ThermistorConfig> thermCfg = {
    id: "temperatureSensor",
    changeThreshold : 0.5f,
    hw : {
        pin: A0,
        seriesResistor : 100000.0f,
        nominalResistance : 100000.0f,
        nominalTemperature : 25.0f,
        betaCoefficient : 3950.0f,
    }
};

SensorConfig<ButtonConfig> reverseSignalCfg = {
    id: "reverseSignal",
    changeThreshold : 0.0f,
    hw : {
        pin: 2,
        inputPullup : true,
    }
};

#endif