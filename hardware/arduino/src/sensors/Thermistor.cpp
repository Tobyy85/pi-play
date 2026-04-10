#include "Thermistor.h"

#include <math.h>

Thermistor::Thermistor(
    ThermistorConfig config
) : _analogPin(config.pin),
_seriesResistor(config.seriesResistor),
_nominalResistance(config.nominalResistance),
_nominalTemperature(config.nominalTemperature),
_betaCoefficient(config.bCoefficient) {
    pinMode(_analogPin, INPUT);
}



int Thermistor::readRawADC() {
    return analogRead(_analogPin);
}

float Thermistor::readResistance() {
    int adcValue = readRawADC();

    if (adcValue == 0) return -_KELVIN_CONVERSION_OFFSET;
    float resistance = _seriesResistor * (1023.0 / (float)adcValue - 1.0);

    return resistance;
}



float Thermistor::calculateTemperatureFromResistance(float resistance) {
    float temperature;

    temperature = resistance / _nominalResistance;
    temperature = log(temperature);
    temperature /= _betaCoefficient;
    temperature += 1.0 / (_nominalTemperature + _KELVIN_CONVERSION_OFFSET);
    temperature = 1.0 / temperature;

    temperature -= _KELVIN_CONVERSION_OFFSET;
    return temperature;
}

float Thermistor::readTemperatureCelsius() {
    float resistance = readResistance();
    return calculateTemperatureFromResistance(resistance);
}


float Thermistor::readTemperatureCelsiusAvg(uint8_t samples, uint16_t delayMs) {
    float sum = 0.0f;

    for (uint8_t i = 0; i < samples; i++) {
        sum += readTemperatureCelsius();
        if (i < samples - 1 && delayMs > 0) {
            delay(delayMs);
        }
    }

    return sum / (float)samples;
}


