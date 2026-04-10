#include <Arduino.h>

#include "src/serialCommunication.h"
#include "src/SensorHandler.h"
#include "src/SensorManager.h"
#include "SensorConfigs.h"  

#include "src/sensors/Thermistor.h"
#include "src/sensors/Button.h"

SensorManager sensorManager;


// Main Thermistor Sensor Setup
Thermistor thermistor(thermCfg.hw);
float readTemperature() {
    return thermistor.readTemperatureCelsiusAvg();
}
SensorHandler tempHandler(thermCfg.id, readTemperature, thermCfg.changeThreshold);


// Reverse Signal Button Setup
Button reverseSignal(reverseSignalCfg.hw);
bool readReverseSignal() {
    return reverseSignal.getState();
}
SensorHandler reverseHandler(reverseSignalCfg.id, readReverseSignal, reverseSignalCfg.changeThreshold);


void setup() {
    SerialCommunication::begin(115200);

    beginVolumeEncoder();

    sensorManager.addSensor(&tempHandler);
    sensorManager.addSensor(&reverseHandler);
}

void loop() {
    checkVolumeEncoderButton();

    sensorManager.updateAll();
    sensorManager.checkSerialRequests();
}