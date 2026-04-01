#include "data.h"

const char *currentPos = data;

void setup()
{
    Serial.begin(9600);
    while (!Serial)
        ; // Čekání na inicializaci USB na R4
}

void loop()
{
    for (int i = 0; i < 2; i++)
    {
        printLineFromProgmem();
    }

    delay(1000);

    // Pokud jsme na konci stringu (narazíme na null terminator), skočíme zase na začátek
    if (pgm_read_byte(currentPos) == '\0')
    {
        currentPos = data;
    }
}

/**
 * Přečte jeden řádek z PROGMEM, pošle ho na Serial a posune globální pointer
 */
void printLineFromProgmem()
{
    char c;
    // Čteme znak po znaku, dokud nenarazíme na konec řádku nebo konec stringu
    while (true)
    {
        c = pgm_read_byte(currentPos);

        if (c == '\n')
        {
            currentPos++;
            Serial.println(); // Nový řádek pro lepší čitelnost
            break;            // Konec aktuálního řádku
        }

        Serial.print(c);

        if (c == '\0')
            break; // Konec celého stringu

        // Serial.print(c);
        currentPos++; // Posuneme se v paměti dál
    }
}