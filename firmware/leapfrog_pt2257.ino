/*
  BlendStep leapfrog controller
  Arduino Nano (ATmega328P, 5 V)

  - Reads analog gain-reduction voltage VGR on A2 (100 mV/dB, 0–4.0 V = 0–40 dB)
  - Programs PT2257 left/right to adjacent taps
  - Writes ONLY the idle channel, and only near k = 0 or 1
  - Emits integer-dB staircase VN on D3 as 62.5 kHz PWM
  - D2 high on odd N so the analog path triangles k

  PT2257 7-bit I2C address is 0x44 (datasheet write address 0x88).
  Wait 200 ms after power-up before talking to the chip.
*/

#include <Wire.h>
#include <stdint.h>

static const uint8_t PT2257_ADDR = 0x44;
static const uint8_t PIN_VN_PWM = 3;   // OC2B
static const uint8_t PIN_INVERT = 2;
static const uint8_t PIN_VGR = A2;

static const float VREF = 5.0f;
static const float VOLTS_PER_DB = 0.1f;
static const float HYST_DB = 0.08f;
static const float ISOLATION = 0.02f; // mix weight that counts as "idle"
static const int MAX_GR_DB = 40;

static int currentN = 0;
static uint8_t attA = 0;
static uint8_t attB = 1;
static bool inited = false;

static uint8_t clampAtt(int db) {
  if (db < 0) return 0;
  if (db > 79) return 79;
  return (uint8_t)db;
}

static void pt2257Write(uint8_t b0, uint8_t b1) {
  Wire.beginTransmission(PT2257_ADDR);
  Wire.write(b0);
  Wire.write(b1);
  Wire.endTransmission();
}

static void setChannel(bool left, uint8_t att) {
  att = clampAtt(att);
  uint8_t tens = att / 10;
  uint8_t ones = att % 10;
  // 10 dB byte first so decade crossings glitch mute-ward.
  uint8_t cmd10 = (left ? 0xB0 : 0x30) | tens;
  uint8_t cmd1 = (left ? 0xA0 : 0x20) | ones;
  pt2257Write(cmd10, cmd1);
}

static void unmute() {
  Wire.beginTransmission(PT2257_ADDR);
  Wire.write(0x78);
  Wire.endTransmission();
}

static void setupPwm62k() {
  pinMode(PIN_VN_PWM, OUTPUT);
  // Fast PWM, 8-bit, prescaler 1 → 16 MHz/256 = 62.5 kHz on OC2B (D3)
  TCCR2A = _BV(COM2B1) | _BV(WGM21) | _BV(WGM20);
  TCCR2B = _BV(CS20);
  OCR2B = 0;
}

static void writeStaircase(int n) {
  if (n < 0) n = 0;
  if (n > MAX_GR_DB) n = MAX_GR_DB;
  // 0–40 dB → 0–4.0 V → 0–204 counts at 5 V full scale
  OCR2B = (uint8_t)((n * 204L) / MAX_GR_DB);
}

static float readGrDb() {
  int raw = analogRead(PIN_VGR);
  float volts = (raw * VREF) / 1023.0f;
  return volts / VOLTS_PER_DB;
}

static float mixWeightA(int n, float fraction) {
  // even n: k = f, weight A = 1-k
  // odd  n: k = 1-f, weight A = f
  if ((n & 1) == 0) return 1.0f - fraction;
  return fraction;
}

void setup() {
  pinMode(PIN_INVERT, OUTPUT);
  digitalWrite(PIN_INVERT, LOW);
  setupPwm62k();
  Wire.begin();
  delay(200);
  unmute();
  setChannel(true, 0);
  setChannel(false, 1);
  attA = 0;
  attB = 1;
  currentN = 0;
  writeStaircase(0);
  inited = true;
}

void loop() {
  if (!inited) return;

  float gr = readGrDb();
  if (gr < 0) gr = 0;
  if (gr > MAX_GR_DB) gr = MAX_GR_DB;

  int n = (int)gr;
  float fraction = gr - n;

  // Hysteresis on the integer boundary so we do not chatter.
  if (n > currentN && fraction < HYST_DB && n == currentN + 1) {
    n = currentN;
    fraction = gr - n;
    if (fraction < 0) fraction = 0;
  } else if (n < currentN && (1.0f - fraction) < HYST_DB && n == currentN - 1) {
    n = currentN;
    fraction = gr - n;
  }

  float wA = mixWeightA(n, fraction);
  float wB = 1.0f - wA;
  uint8_t wantA;
  uint8_t wantB;
  if ((n & 1) == 0) {
    wantA = clampAtt(n);
    wantB = clampAtt(n + 1);
  } else {
    wantA = clampAtt(n + 1);
    wantB = clampAtt(n);
  }

  // Only program a channel whose mix weight is essentially zero.
  if (wantA != attA && wA <= ISOLATION) {
    setChannel(true, wantA);
    attA = wantA;
  }
  if (wantB != attB && wB <= ISOLATION) {
    setChannel(false, wantB);
    attB = wantB;
  }

  currentN = n;
  writeStaircase(n);
  digitalWrite(PIN_INVERT, (n & 1) ? HIGH : LOW);
}
