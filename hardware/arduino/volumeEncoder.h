/**
 * Volume Encoder
 * Sends 1.0f for clockwise rotation, -1.0f for counterclockwise rotation, and 0.0f when the button is pressed.
 */

#ifndef VOLUMEENCODER_H
#define VOLUMEENCODER_H

#include <Arduino.h>


void beginVolumeEncoder();
void checkVolumeEncoderButton();


#endif