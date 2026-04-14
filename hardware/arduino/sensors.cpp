#include "sensors.h"

#include "src/SensorHandler.h"
#include "src/SensorManager.h"
#include "sensorConfigs.h"  

#include "src/sensors/Thermistor.h"
#include "src/sensors/Button.h"
#include "src/sensors/Photoresistor.h"



namespace {
    SensorManager sensorManager;

    Thermistor thermistor(temperatureCfg.hw);
    float readTemperature() { return thermistor.readTemperatureCelsiusAvg(10, 2); }
    SensorHandler tempHandler(temperatureCfg.id, readTemperature, temperatureCfg.changeThreshold);

    Button reverseSignal(reverseSignalCfg.hw);
    bool readReverseSignal() { return reverseSignal.getState(); }
    SensorHandler reverseHandler(reverseSignalCfg.id, readReverseSignal, reverseSignalCfg.changeThreshold);

    Photoresistor lightSensor(lightSensorCfg.hw.pin);
    float readLightLevel() { return lightSensor.readPercentageAvg(10, 2); }
    SensorHandler lightSensorHandler(lightSensorCfg.id, readLightLevel, lightSensorCfg.changeThreshold);

    Button playPauseButton(playPauseButtonCfg.hw);
    bool readPlayPause() { return playPauseButton.getState(); }
    SensorHandler playPauseHandler(playPauseButtonCfg.id, readPlayPause, playPauseButtonCfg.changeThreshold);

    Button previousTrackButton(previousTrackButtonCfg.hw);
    bool readPreviousTrack() { return previousTrackButton.getState(); }
    SensorHandler previousTrackHandler(previousTrackButtonCfg.id, readPreviousTrack, previousTrackButtonCfg.changeThreshold);

    Button nextTrackButton(nextTrackButtonCfg.hw);
    bool readNextTrack() { return nextTrackButton.getState(); }
    SensorHandler nextTrackHandler(nextTrackButtonCfg.id, readNextTrack, nextTrackButtonCfg.changeThreshold);

    Button answerCallButton(answerCallButtonCfg.hw);
    bool readAnswerCall() { return answerCallButton.getState(); }
    SensorHandler answerCallHandler(answerCallButtonCfg.id, readAnswerCall, answerCallButtonCfg.changeThreshold);

    Button hangupButton(hangupButtonCfg.hw);
    bool readHangup() { return hangupButton.getState(); }
    SensorHandler hangupHandler(hangupButtonCfg.id, readHangup, hangupButtonCfg.changeThreshold);
}


void beginSensors() {
    sensorManager.addSensor(&tempHandler);
    sensorManager.addSensor(&reverseHandler);
    sensorManager.addSensor(&lightSensorHandler);

    sensorManager.addSensor(&playPauseHandler);
    sensorManager.addSensor(&previousTrackHandler);
    sensorManager.addSensor(&nextTrackHandler);
    sensorManager.addSensor(&answerCallHandler);
    sensorManager.addSensor(&hangupHandler);
}

void updateSensors() {
    sensorManager.updateAll();
    sensorManager.checkSerialRequests();
}