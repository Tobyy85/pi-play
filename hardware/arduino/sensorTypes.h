#ifndef SENSOR_TYPES_H
#define SENSOR_TYPES_H

#include <Arduino.h>

/**
 * @brief Template structure for sensor configuration
 * @tparam T Hardware-specific configuration type (e.g., ThermistorConfig, ButtonConfig)
 */
template <typename T>
struct SensorConfig {
    String id;              ///< Unique sensor identifier
    float changeThreshold;  ///< Minimum change to trigger update
    T hw;                   ///< Hardware-specific configuration
};

/**
 * @brief Configuration structure for NTC thermistor sensors
 */
struct ThermistorConfig {
    uint8_t pin;            ///< Analog pin number
    float seriesResistor;   ///< Series resistor value in Ohms
    float nominalResistance;///< Thermistor resistance at nominal temperature (Ohms)
    float nominalTemperature;///< Nominal temperature in Celsius (typically 25°C)
    float betaCoefficient;     ///< Beta coefficient of thermistor (K)
};

/**
 * @brief Configuration structure for button/switch sensors
 */
struct ButtonConfig
{
    uint8_t pin;      ///< Digital pin number
    bool inputPullup; ///< Enable internal pull-up resistor
};


/**
 * @brief Configuration structure for rotary encoder sensors
 */
struct RotaryEncoderConfig
{
    uint8_t pinA;     ///< Pin number for encoder channel A
    uint8_t pinB;     ///< Pin number for encoder channel B
    uint8_t pinButton;///< Pin number for encoder button (if applicable)
};

/**
 * @brief Configuration structure for photoresistor sensors
 */
struct PhotoresistorConfig {
    uint8_t pin;       ///< Analog pin number
};

/**
 * @brief Configuration structure for Engine Detector sensors
 */
struct EngineDetectorConfig {
    uint8_t detectionPin;    ///< Digital pin for engine state detection
    uint8_t pinOn;  ///< Digital pin to pulse when engine turns on
    uint8_t pinOff; ///< Digital pin to pulse when engine turns off
};

#endif