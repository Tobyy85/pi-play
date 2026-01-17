#ifndef THERMISTOR_H
#define THERMISTOR_H

#include <Arduino.h>


class Thermistor {
public:
    /**
     * @brief Constructor for NTC Thermistor sensor
     * @param analogPin Analog pin number where thermistor is connected
     * @param seriesResistor Value of the series resistor in voltage divider (Ohms)
     * @param nominalResistance Resistance at nominal temperature (Ohms), typically 10,000 or 100,000
     * @param nominalTemperature Nominal temperature in Celsius, typically 25°C
     * @param betaCoefficient Beta coefficient of the thermistor (K), typically 3950
     */
    Thermistor(
        uint8_t analogPin,
        float seriesResistor = 10000.0f,
        float nominalResistance = 10000.0f,
        float nominalTemperature = 25.0f,
        float betaCoefficient = 3950.0f
    );



    float readTemperatureCelsius();
    float readTemperatureCelsiusAvg(uint8_t samples = 10, uint16_t delayMs = 5);


private:
    const float _KELVIN_CONVERSION_OFFSET = 273.15f;

    uint8_t _analogPin;
    float _seriesResistor;
    float _nominalResistance;
    float _nominalTemperature;  // in Celsius
    float _betaCoefficient;

    int readRawADC();
    float readResistance();
    float calculateTemperatureFromResistance(float resistance);
};

#endif