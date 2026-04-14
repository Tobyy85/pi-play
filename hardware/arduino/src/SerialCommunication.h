#ifndef SERIAL_COMMUNICATION_H
#define SERIAL_COMMUNICATION_H

#include <Arduino.h>

/**
 * @brief Static utility class for serial JSON communication
 */
class SerialCommunication {
public:
    /**
     * @brief Initialize serial communication
     * @param baudRate Baud rate for serial communication (e.g., 9600, 115200)
     */
    static void begin(unsigned long baudRate);

    /**
     * @brief Send sensor data as JSON with float value
     * @param sensorId Identifier of the sensor
     * @param value Float value to send
     * @note Output format: {"sensorId":"<id>","value":<value>}
     */
    static void sendJson(String sensorId, float value);

    /**
     * @brief Send sensor data as JSON with boolean value
     * @param sensorId Identifier of the sensor
     * @param value Boolean value to send (outputs true/false)
     * @note Output format: {"sensorId":"<id>","value":true|false}
     */
    static void sendJson(String sensorId, bool value);
};
#endif