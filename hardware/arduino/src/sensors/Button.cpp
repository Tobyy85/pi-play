#include "Button.h"


Button::Button(int pin, bool input_pullup) {
    _pin = pin;
    _input_pullup = input_pullup;
    pinMode(pin, input_pullup ? INPUT_PULLUP : INPUT);
}

bool Button::getState() {
    bool state = digitalRead(_pin);
    return _input_pullup ? !state : state;
}