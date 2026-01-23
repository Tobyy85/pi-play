#include <Arduino.h>

#include "src/serialCommunication.h"
#include "src/SensorHandler.h"
#include "src/SensorManager.h"
#include "SensorConfigs.h"  

#include "src/sensors/Thermistor.h"
#include "src/sensors/Button.h"

SensorManager sensorManager;


// Main Thermistor Sensor Setup
Thermistor thermistor(thermCfg.hw.pin,
    thermCfg.hw.seriesResistor,
    thermCfg.hw.nominalResistance,
    thermCfg.hw.nominalTemperature,
    thermCfg.hw.bCoefficient
);
float readTemperature() {
    return thermistor.readTemperatureCelsiusAvg();
}
SensorHandler tempHandler(thermCfg.id, readTemperature, thermCfg.changeThreshold);


// Reverse Signal Button Setup
Button reverseSignal(reverseSignalCfg.hw.pin, reverseSignalCfg.hw.inputPullup);
bool readReverseSignal() {
    return reverseSignal.getState();
}
SensorHandler reverseHandler(reverseSignalCfg.id, readReverseSignal, reverseSignalCfg.changeThreshold);


void setup() {
    SerialCommunication::begin(115200);
    Serial.begin(115200);

    sensorManager.addSensor(&tempHandler);
    sensorManager.addSensor(&reverseHandler);
}

void loop() {
    sensorManager.updateAll();

    sensorManager.checkSerialRequests();
}