#ifndef BUTTON_H
#define BUTTON_H

#include <Arduino.h>


class Button {
public:
    Button(int pin, bool input_pullup = false);
    bool getState();

private:
    uint8_t _pin;
    bool _input_pullup;
};
#endif