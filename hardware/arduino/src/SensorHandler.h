#ifndef SENSOR_HANDLER_H
#define SENSOR_HANDLER_H

#include <Arduino.h>
#include "ChangeDetector.h"

typedef float (*FloatSensorReadCallback)();
typedef bool (*BoolSensorReadCallback)();

/** @brief Enumeration of supported sensor data types */
enum class SensorType : uint8_t {
    FLOAT,  ///< Sensor returns floating point values
    BOOL    ///< Sensor returns boolean values
};

/**
 * @brief Handler class for managing individual sensors with change detection
 */
class SensorHandler {
private:
    String _sensorId;
    union {
        FloatSensorReadCallback floatCallback;
        BoolSensorReadCallback boolCallback;
    } _readCallback;
    SensorType _sensorType;
    ChangeDetector<float> _changeDetector;

public:
    /**
     * @brief Constructor for float-type sensor handler
     * @param id Unique identifier for the sensor
     * @param callback Function pointer to read float sensor value
     * @param changeThreshold Minimum change to trigger update (default: 0.0)
     */
    SensorHandler(const String& id, FloatSensorReadCallback callback, float changeThreshold = 0.0f);

    /**
     * @brief Constructor for bool-type sensor handler
     * @param id Unique identifier for the sensor
     * @param callback Function pointer to read boolean sensor value
     * @param changeThreshold Minimum change to trigger update (default: 0.0)
     */
    SensorHandler(const String& id, BoolSensorReadCallback callback, float changeThreshold = 0.0f);

    /**
     * @brief Update sensor and send value if changed
     */
    void update();

    /**
     * @brief Force send current sensor value regardless of change
     */
    void sendCurrentValue();

    /**
     * @brief Get sensor identifier
     * @return Reference to sensor ID string
     */
    const String& getId() const {
        return _sensorId;
    }
};

#endif