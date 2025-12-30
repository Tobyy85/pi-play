#ifndef SERIAL_COMMUNICATION_H
#define SERIAL_COMMUNICATION_H

#include <Arduino.h>


class SerialCommunication {
public:
    static void begin(unsigned long baudRate);
    static void sendJson(String type, String value);
};
#endif