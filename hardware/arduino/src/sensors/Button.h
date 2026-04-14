#ifndef BUTTON_H
#define BUTTON_H

#include <Arduino.h>

#include "../../sensorTypes.h"

/**
 * @brief Class for handling digital button/switch inputs
 */
class Button {
public:
    /**
     * @param pin Digital pin number where button is connected
     * @param input_pullup If true, enables internal pull-up resistor (active LOW)
     */
    Button(ButtonConfig config);

    /**
     * @brief Read current button state
     * @return true if button is pressed, false otherwise
     * @note When using INPUT_PULLUP, the logic is inverted automatically
     */
    bool getState();

private:
    uint8_t _pin;
    bool _input_pullup;
};
#endif