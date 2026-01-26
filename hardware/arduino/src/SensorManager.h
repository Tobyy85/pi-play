#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Arduino.h>
#include "SensorHandler.h"

/** @brief Maximum number of sensors that can be managed */
#define MAX_SENSORS 10

/**
 * @brief Manager class for handling multiple sensors and serial communication
 */
class SensorManager {
private:
    SensorHandler* _sensors[MAX_SENSORS];  ///< Array of sensor handler pointers
    uint8_t sensorCount = 0;               ///< Current number of registered sensors

public:
    /**
     * @brief Register a new sensor with the manager
     * @param sensor Pointer to SensorHandler to add
     * @return true if added successfully, false if MAX_SENSORS reached
     */
    bool addSensor(SensorHandler* sensor);

    /**
     * @brief Update all registered sensors (check for changes and send)
     */
    void updateAll();

    /**
     * @brief Handle a request for specific sensor data
     * @param requestedId ID of the sensor to query
     */
    void handleRequest(const String& requestedId);

    /**
     * @brief Check serial port for incoming sensor requests
     */
    void checkSerialRequests();

};

#endif