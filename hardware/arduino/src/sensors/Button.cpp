#include "Button.h"


Button::Button(ButtonConfig config) {
    _pin = config.pin;
    _input_pullup = config.inputPullup;
    pinMode(_pin, _input_pullup ? INPUT_PULLUP : INPUT);
}

bool Button::getState() {
    bool state = digitalRead(_pin);
    return _input_pullup ? !state : state;
}