#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#include "sensorTypes.h"


static const EngineDetectorConfig engineDetectorCfg = {
    detectionPin: 5,
    pinOn : A4,
    pinOff : A5,
};

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

static const SensorConfig<PhotoresistorConfig> lightSensorCfg = {
    id: "lightSensor",
    changeThreshold : 5.0f,
    hw : {
        pin: A1,
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

static const SensorConfig<ButtonConfig> playPauseButtonCfg = {
    id: "playPause",
    changeThreshold : 0.0f,
    hw : {
        pin: 6,
        inputPullup : true,
    }
};

static const SensorConfig<ButtonConfig> previousTrackButtonCfg = {
    id: "previousTrack",
    changeThreshold : 0.0f,
    hw : {
        pin: 7,
        inputPullup : true,
    }
};

static const SensorConfig<ButtonConfig> nextTrackButtonCfg = {
    id: "nextTrack",
    changeThreshold : 0.0f,
    hw : {
        pin: 8,
        inputPullup : true,
    }
};

static const SensorConfig<ButtonConfig> answerCallButtonCfg = {
    id: "answerCall",
    changeThreshold : 0.0f,
    hw : {
        pin: 9,
        inputPullup : true,
    }
};

static const SensorConfig<ButtonConfig> hangupButtonCfg = {
    id: "hangup",
    changeThreshold : 0.0f,
    hw : {
        pin: 10,
        inputPullup : true,
    }
};

#endif