#include <Arduino.h>

#include "src/UltrasonicSensor.h"
#include "src/serialCommunication.h"


UltrasonicSensor sensorLeft(3, 2);
UltrasonicSensor sensorMid(6, 5);
UltrasonicSensor sensorRight(10, 9);

const int SAMPLE = 5;
const int SAMPLE_DELAY_MS = 50;
const int MAX_DISTANCE = 200;


void setup() {
    SerialCommunication::begin(9600);
}


void loop() {
    int leftSensorValue = 0;
    int midSensorValue = 0;
    int rightSensorValue = 0;

    getTrimmedAverageDistances(leftSensorValue, midSensorValue, rightSensorValue);

    int leftLevel = getSensorLevel(leftSensorValue);
    int midLevel = getSensorLevel(midSensorValue);
    int rightLevel = getSensorLevel(rightSensorValue);

    SerialCommunication::sendJson("left", (float)leftLevel);
    SerialCommunication::sendJson("mid", (float)midLevel);
    SerialCommunication::sendJson("right", (float)rightLevel);


}



unsigned int getSensorLevel(int distance) {
    if (distance <= 0) {
        return 0;
    }

    const int maxDistancePerLevelCm[10] = { 20, 25, 30, 35, 45, 55, 70, 90, 115, 145 };

    for (int i = 0; i < 10; i++) {
        if (distance <= maxDistancePerLevelCm[i]) {
            return 10 - i;
        }
    }

    return 0;
}

void getTrimmedAverageDistances(int& leftDistance, int& midDistance, int& rightDistance) {
    if (SAMPLE <= 0) {
        leftDistance = 0;
        midDistance = 0;
        rightDistance = 0;
        return;
    }

    long sumLeft = 0;
    long sumMid = 0;
    long sumRight = 0;

    int minLeft = MAX_DISTANCE;
    int minMid = MAX_DISTANCE;
    int minRight = MAX_DISTANCE;

    int maxLeft = 0;
    int maxMid = 0;
    int maxRight = 0;

    for (int i = 0; i < SAMPLE; i++) {
        int leftSample = sensorLeft.getDistance();
        int midSample = sensorMid.getDistance();
        int rightSample = sensorRight.getDistance();

        sumLeft += leftSample;
        sumMid += midSample;
        sumRight += rightSample;

        minLeft = min(minLeft, leftSample);
        minMid = min(minMid, midSample);
        minRight = min(minRight, rightSample);

        maxLeft = max(maxLeft, leftSample);
        maxMid = max(maxMid, midSample);
        maxRight = max(maxRight, rightSample);

        delay(SAMPLE_DELAY_MS);
    }

    if (SAMPLE < 3) {
        leftDistance = sumLeft / SAMPLE;
        midDistance = sumMid / SAMPLE;
        rightDistance = sumRight / SAMPLE;
        return;
    }

    leftDistance = (sumLeft - minLeft - maxLeft) / (SAMPLE - 2);
    midDistance = (sumMid - minMid - maxMid) / (SAMPLE - 2);
    rightDistance = (sumRight - minRight - maxRight) / (SAMPLE - 2);
}