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
    float bCoefficient;     ///< Beta coefficient of thermistor (K)
};

/**
 * @brief Configuration structure for button/switch sensors
 */
struct ButtonConfig
{
    uint8_t pin;      ///< Digital pin number
    bool inputPullup; ///< Enable internal pull-up resistor
};


#endif