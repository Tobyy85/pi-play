#ifndef CHANGE_DETECTOR_H
#define CHANGE_DETECTOR_H

#include <Arduino.h>

template <typename T>
class ChangeDetector {
public:
    ChangeDetector(T changeThreshold = 0) {
        _changeThreshold = changeThreshold;
        _lastValue = 0;
        _hasValue = false;
    }

    bool hasChanged(T newValue) {

        if (!_hasValue || abs(newValue - _lastValue) > _changeThreshold) {
            _lastValue = newValue;
            _hasValue = true;
            return true;
        }
        return false;
    }

    T getLastValue() {
        return _lastValue;
    }

    void setChangeThreshold(T threshold) {
        _changeThreshold = threshold;
    }
    void reset() {
        _hasValue = false;
        _lastValue = 0;
    }

private:
    T _changeThreshold;
    T _lastValue;
    bool _hasValue;
};
#endif