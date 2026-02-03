/*
    This is just for simulating GPS data from GPS module. This is not supposed to be in the final product.
    Simulates GPS data by sending NMEA sentences over Serial.
*/

float latitude = 50.0870; // start: Prague
float longitude = 14.4208;
const float speed_kmh = 20.0;

const float speed_knots = speed_kmh * 0.539957;
const float course_deg = 0.0f;

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    sendRMC();
    sendGGA();
    updatePosition();

    delay(1000);
}

void updatePosition()
{
    float speed_mps = speed_kmh / 3.6;
    float course_rad = course_deg * DEG_TO_RAD;

    float d_north = cos(course_rad) * speed_mps;
    float d_east = sin(course_rad) * speed_mps;

    float delta_lat = d_north / 111320.0;
    float delta_lon = d_east / (111320.0 * cos(latitude * DEG_TO_RAD));

    latitude += delta_lat;
    longitude += delta_lon;
}

void sendRMC()
{
    char buffer[100];
    char data[90];
    char latMinStr[10], lonMinStr[10], speedStr[10], courseStr[10];

    int latDeg = int(latitude);
    float latMin = (latitude - latDeg) * 60;
    dtostrf(latMin, 7, 4, latMinStr);

    int lonDeg = int(longitude);
    float lonMin = (longitude - lonDeg) * 60;
    dtostrf(lonMin, 7, 4, lonMinStr);

    dtostrf(speed_knots, 4, 1, speedStr);
    dtostrf(course_deg, 5, 1, courseStr);

    sprintf(data, "GPRMC,120000,A,%02d%s,N,%03d%s,E,%s,%s,010226,,,A",
            latDeg, latMinStr, lonDeg, lonMinStr, speedStr, courseStr);

    byte checksum = calculateChecksum(data);
    sprintf(buffer, "$%s*%02X", data, checksum);
    Serial.println(buffer);
}

void sendGGA()
{
    char buffer[100];
    char data[90];
    char latMinStr[10], lonMinStr[10];

    int latDeg = int(latitude);
    float latMin = (latitude - latDeg) * 60;
    dtostrf(latMin, 7, 4, latMinStr);

    int lonDeg = int(longitude);
    float lonMin = (longitude - lonDeg) * 60;
    dtostrf(lonMin, 7, 4, lonMinStr);

    sprintf(data, "GPGGA,120000,%02d%s,N,%03d%s,E,1,08,1.0,250.0,M,46.9,M,,",
            latDeg, latMinStr, lonDeg, lonMinStr);

    byte checksum = calculateChecksum(data);
    sprintf(buffer, "$%s*%02X", data, checksum);
    Serial.println(buffer);
}

byte calculateChecksum(const char *data)
{
    byte checksum = 0;
    for (int i = 0; data[i] != '\0'; i++)
    {
        checksum ^= data[i];
    }
    return checksum;
}

void printLat(float lat)
{
    int deg = int(lat);
    float min = (lat - deg) * 60;
    Serial.print(deg * 100 + min, 4);
}

void printLon(float lon)
{
    int deg = int(lon);
    float min = (lon - deg) * 60;
    Serial.print(deg * 100 + min, 4);
}
