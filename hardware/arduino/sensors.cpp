#include "sensors.h"

#include "src/SensorHandler.h"
#include "src/SensorManager.h"
#include "SensorConfigs.h"  

#include "src/sensors/Thermistor.h"
#include "src/sensors/Button.h"



namespace {
    SensorManager sensorManager;

    Thermistor thermistor(temperatureCfg.hw);
    float readTemperature() {
        return thermistor.readTemperatureCelsiusAvg();
    }
    SensorHandler tempHandler(temperatureCfg.id, readTemperature, temperatureCfg.changeThreshold);


    // Reverse Signal Button Setup
    Button reverseSignal(reverseSignalCfg.hw);
    bool readReverseSignal() {
        return reverseSignal.getState();
    }
    SensorHandler reverseHandler(reverseSignalCfg.id, readReverseSignal, reverseSignalCfg.changeThreshold);

}


void beginSensors() {
    sensorManager.addSensor(&tempHandler);
    sensorManager.addSensor(&reverseHandler);
}

void updateSensors() {
    sensorManager.updateAll();
    sensorManager.checkSerialRequests();
}