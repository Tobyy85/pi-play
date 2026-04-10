#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#include "sensorTypes.h"

static const SensorConfig<ThermistorConfig> temperatureCfg = {
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

static const SensorConfig<ButtonConfig> reverseSignalCfg = {
    id: "reverseSignal",
    changeThreshold : 0.0f,
    hw : {
        pin: 2,
        inputPullup : true,
    }
};

static const SensorConfig<RotaryEncoderConfig> volumeEncoderCfg = {
    id: "volumeEncoder",
    changeThreshold : 0.0f,
    hw : {
        pinA: 3,
        pinB : 4,
        pinButton : 5,
    }
};

#endif