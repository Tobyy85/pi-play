#ifndef CHANGE_DETECTOR_H
#define CHANGE_DETECTOR_H

#include <Arduino.h>

/**
 * @brief Template class for detecting value changes above a threshold
 * @tparam T Type of the value to monitor (e.g., float, int)
 */
template <typename T>
class ChangeDetector {
public:
    /**
     * @param changeThreshold Minimum change required to trigger detection (default: 0)
     */
    ChangeDetector(T changeThreshold = 0) {
        _changeThreshold = changeThreshold;
        _lastValue = 0;
        _hasValue = false;
    }

    /**
     * @brief Check if value has changed beyond threshold
     * @param newValue New value to compare against last stored value
     * @return true if change exceeds threshold or first call, false otherwise
     */
    bool hasChanged(T newValue) {

        if (!_hasValue || abs(newValue - _lastValue) > _changeThreshold) {
            _lastValue = newValue;
            _hasValue = true;
            return true;
        }
        return false;
    }

    /**
     * @brief Get the last stored value
     * @return Last value that triggered a change
     */
    T getLastValue() {
        return _lastValue;
    }

    /**
     * @brief Set new change threshold
     * @param threshold New minimum change required to trigger detection
     */
    void setChangeThreshold(T threshold) {
        _changeThreshold = threshold;
    }

    /**
     * @brief Reset detector to initial state
     */
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