/*
  BlendStep leapfrog controller
  Arduino Nano (ATmega328P, 5 V)

  - Reads analog gain-reduction voltage VGR on A2 (100 mV/dB, 0–4.0 V = 0–40 dB)
  - Programs PT2257 left/right, rewriting ONLY the idle channel
  - Blank EEPROM: integer-dB staircase VN on D3, D2 high on odd N
  - Valid ladder table: 10-bit Vk on D9 (weight of channel B), D2 held low

  PT2257 7-bit I2C address is 0x44 (datasheet write address 0x88).
  Wait 200 ms after power-up before talking to the chip.

  Bench cal, 115200, one command per line. Both channels are referenced to
  VA at code 0. Stored value is millidB of (attenuation − code). The Nano
  has no tap ADC: meter volts are entered, then averaged here.
    G <code>                 both channels to code 0–41; replies with N
    N [auto|<count>]         sample count; default scales 8 / 16 / 32
    VA <volts>  VB <volts>   one meter reading; the Nth one stages the mean
    A <code> <milli>         stage a hand-computed error (no spread check)
    B <code> <milli>         same for channel B
    P <Hz> <mV> <A|B> <code> <milli>
                             spot-check vs the table; never writes it
    W                       store if every code is staged and none are NOISY
    W!                      store even if a code was NOISY
    R                       dump the table
    Z                       clear the magic; jumper Vk back to U5B
    U                       leave bench hold without writing
*/

#include <EEPROM.h>
#include <Wire.h>
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static const uint8_t PT2257_ADDR = 0x44;
static const uint8_t PIN_VN_PWM = 3;   // OC2B
static const uint8_t PIN_VK_PWM = 9;   // OC1A
static const uint8_t PIN_INVERT = 2;
static const uint8_t PIN_VGR = A2;

static const float VREF = 5.0f;
static const float VOLTS_PER_DB = 0.1f;
static const float HYST_DB = 0.08f;
static const float ISOLATION = 0.02f; // mix weight that counts as "idle"
static const int MAX_GR_DB = 40;
static const float DB_TO_NEPER = 0.11512925465f; // ln(10) / 20

static const uint8_t CAL_CODES = 42; // codes 0..41
static const uint8_t CAL_LAST = 41;
static const int32_t CAL_MAX_MILLI = 40000L;
static const int EE_MAGIC = 0;
static const int EE_COUNT = 4;
static const int EE_A = 5;
static const int EE_B = 5 + 42 * 2;
static const int EE_SUM = 5 + 42 * 4;
static const char MAGIC[4] = {'B', 'S', 'C', '1'};

struct Seg {
  uint8_t nearCode;
  uint8_t farCode;
  uint8_t nearIsA;
  int32_t nearMilli;
  int32_t farMilli;
};

static int currentN = 0;
static int currentSeg = 0;
static uint8_t attA = 0;
static uint8_t attB = 1;
static bool inited = false;
static bool calibrated = false;
static bool benchHold = false;
// Bench G leaves both channels on a measurement code. The next control
// loop has to rewrite the live tap once; after that, only the idle tap moves.
static bool forceCodes = false;

static int16_t errA[CAL_CODES];
static int16_t errB[CAL_CODES];
static uint8_t gotA[6];
static uint8_t gotB[6];
static Seg segs[41];
static uint8_t segCount = 0;

static const uint8_t SAMPLE_CAP = 32;
static int8_t sampleOverride = -1; // -1: 8 / 16 / 32 by code
static bool benchArmed = false;
static bool haveRef = false;
static uint8_t benchCode = 0;
static float vRef = 0;
static float sampA[SAMPLE_CAP];
static float sampB[SAMPLE_CAP];
static uint8_t sampCountA = 0;
static uint8_t sampCountB = 0;
static uint8_t noisyA[6];
static uint8_t noisyB[6];

static char line[64];
static uint8_t lineLen = 0;

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

static void enableCalPwm() {
  pinMode(PIN_VK_PWM, OUTPUT);
  // 10-bit fast PWM, prescaler 1 → 16 MHz/1024 = 15.625 kHz on OC1A (D9)
  TCCR1A = _BV(COM1A1) | _BV(WGM11) | _BV(WGM10);
  TCCR1B = _BV(WGM12) | _BV(CS10);
  OCR1A = 0;
}

static void disableCalPwm() {
  TCCR1A = 0;
  TCCR1B = 0;
  OCR1A = 0;
  pinMode(PIN_VK_PWM, OUTPUT);
  digitalWrite(PIN_VK_PWM, LOW);
}

static void writeStaircase(int n) {
  if (n < 0) n = 0;
  if (n > MAX_GR_DB) n = MAX_GR_DB;
  // 0–40 dB → 0–4.0 V → 0–204 counts at 5 V full scale
  OCR2B = (uint8_t)((n * 204L) / MAX_GR_DB);
}

static void writeVk(float kB) {
  if (kB < 0) kB = 0;
  if (kB > 1) kB = 1;
  OCR1A = (uint16_t)(kB * 1023.0f + 0.5f);
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

static int32_t relMilli(bool isA, uint8_t code) {
  int32_t milli = (int32_t)code * 1000L;
  milli += isA ? errA[code] : errB[code];
  milli -= errA[0];
  return milli;
}

static void buildSegments() {
  segCount = 0;
  uint8_t nearIsA = 1;
  uint8_t nearCode = 0;
  int32_t nearMilli = 0;
  for (uint8_t guard = 0; guard <= CAL_LAST && segCount < 41; guard++) {
    if (nearCode >= CAL_LAST) break;
    bool farIsA = !nearIsA;
    int farCode = -1;
    int32_t farMilli = 0;
    for (int code = nearCode + 1; code <= CAL_LAST; code++) {
      int32_t db = relMilli(farIsA, (uint8_t)code);
      if (db > nearMilli) {
        farCode = code;
        farMilli = db;
        break;
      }
    }
    if (farCode < 0) break;
    Seg &s = segs[segCount++];
    s.nearCode = nearCode;
    s.farCode = (uint8_t)farCode;
    s.nearIsA = nearIsA;
    s.nearMilli = nearMilli;
    s.farMilli = farMilli;
    if (farMilli >= CAL_MAX_MILLI) break;
    nearIsA = farIsA ? 1 : 0;
    nearCode = (uint8_t)farCode;
    nearMilli = farMilli;
  }
  currentSeg = 0;
}

static float gainFromDb(float db) {
  return expf(-db * DB_TO_NEPER);
}

static float kFarFor(const Seg &s, float gDb) {
  float nearDb = s.nearMilli / 1000.0f;
  float farDb = s.farMilli / 1000.0f;
  float target = gDb;
  if (target < nearDb) target = nearDb;
  if (target > farDb) target = farDb;
  float denom = gainFromDb(farDb) - gainFromDb(nearDb);
  if (fabsf(denom) < 1e-12f) return 0;
  float k = (gainFromDb(target) - gainFromDb(nearDb)) / denom;
  if (k < 0) k = 0;
  if (k > 1) k = 1;
  return k;
}

static int findSegment(float gDb) {
  if (segCount == 0) return 0;
  for (uint8_t i = 0; i < segCount; i++) {
    float farDb = segs[i].farMilli / 1000.0f;
    if (gDb < farDb || (uint8_t)(i + 1) == segCount) return i;
  }
  return segCount - 1;
}

static int applyHyst(int raw, float gDb) {
  if (raw == currentSeg) return raw;
  if (currentSeg < 0 || currentSeg >= segCount) return raw;
  if (raw != currentSeg + 1 && raw != currentSeg - 1) return raw;
  float edge = (raw > currentSeg)
                   ? segs[currentSeg].farMilli / 1000.0f
                   : segs[raw].farMilli / 1000.0f;
  if (fabsf(gDb - edge) < HYST_DB) return currentSeg;
  return raw;
}

static uint16_t tableSum() {
  uint16_t sum = CAL_CODES;
  for (uint8_t i = 0; i < CAL_CODES; i++) {
    sum = (uint16_t)(sum + (uint16_t)errA[i]);
    sum = (uint16_t)(sum + (uint16_t)errB[i]);
  }
  return sum;
}

static void markGot(uint8_t *bits, uint8_t code) {
  bits[code >> 3] |= (uint8_t)(1u << (code & 7));
}

static bool allGot(const uint8_t *bits) {
  for (uint8_t i = 0; i < 5; i++) {
    if (bits[i] != 0xFF) return false;
  }
  return (bits[5] & 0x03) == 0x03;
}

static void markAllGot() {
  memset(gotA, 0xFF, 5);
  memset(gotB, 0xFF, 5);
  gotA[5] = 0x03;
  gotB[5] = 0x03;
}

static void eeWriteU16(int addr, uint16_t value) {
  EEPROM.update(addr, (uint8_t)(value & 0xFF));
  EEPROM.update(addr + 1, (uint8_t)(value >> 8));
}

static uint16_t eeReadU16(int addr) {
  uint16_t value = EEPROM.read(addr);
  value |= (uint16_t)EEPROM.read(addr + 1) << 8;
  return value;
}

static void eeWriteI16(int addr, const int16_t *data, uint8_t count) {
  for (uint8_t i = 0; i < count; i++) eeWriteU16(addr + (int)i * 2, (uint16_t)data[i]);
}

static void eeReadI16(int addr, int16_t *data, uint8_t count) {
  for (uint8_t i = 0; i < count; i++) data[i] = (int16_t)eeReadU16(addr + (int)i * 2);
}

static bool loadTable() {
  for (uint8_t i = 0; i < 4; i++) {
    if (EEPROM.read(EE_MAGIC + i) != MAGIC[i]) return false;
  }
  if (EEPROM.read(EE_COUNT) != CAL_CODES) return false;
  eeReadI16(EE_A, errA, CAL_CODES);
  eeReadI16(EE_B, errB, CAL_CODES);
  if (eeReadU16(EE_SUM) != tableSum()) return false;
  markAllGot();
  return true;
}

static void saveTable() {
  for (uint8_t i = 0; i < 4; i++) EEPROM.update(EE_MAGIC + i, MAGIC[i]);
  EEPROM.update(EE_COUNT, CAL_CODES);
  eeWriteI16(EE_A, errA, CAL_CODES);
  eeWriteI16(EE_B, errB, CAL_CODES);
  eeWriteU16(EE_SUM, tableSum());
}

static bool activateTable() {
  buildSegments();
  if (segCount == 0) return false;
  enableCalPwm();
  calibrated = true;
  digitalWrite(PIN_INVERT, LOW);
  return true;
}

static bool parseTwoInts(const char *s, long *a, long *b) {
  char *end = nullptr;
  while (*s == ' ') s++;
  long first = strtol(s, &end, 10);
  if (end == s) return false;
  s = end;
  while (*s == ' ') s++;
  long second = strtol(s, &end, 10);
  if (end == s) return false;
  *a = first;
  *b = second;
  return true;
}

static uint8_t samplesForCode(uint8_t code) {
  if (sampleOverride > 0) return (uint8_t)sampleOverride;
  if (code <= 15) return 8;
  if (code <= 24) return 16;
  return 32;
}

static float spreadLimitDb(uint8_t code) {
  if (code <= 15) return 0.05f;
  if (code <= 24) return 0.10f;
  return 0.20f;
}

static void setFlag(uint8_t *bits, uint8_t code, bool on) {
  uint8_t mask = (uint8_t)(1u << (code & 7));
  if (on) bits[code >> 3] |= mask;
  else bits[code >> 3] &= (uint8_t)~mask;
}

static bool flagAt(const uint8_t *bits, uint8_t code) {
  return (bits[code >> 3] & (uint8_t)(1u << (code & 7))) != 0;
}

static int32_t roundMilli(float db) {
  long milli = lroundf(db * 1000.0f);
  if (milli > 20000) milli = 20000;
  if (milli < -20000) milli = -20000;
  return (int32_t)milli;
}

static void finishSamples(bool isA) {
  uint8_t n = isA ? sampCountA : sampCountB;
  float *buf = isA ? sampA : sampB;
  float sum = 0;
  for (uint8_t i = 0; i < n; i++) sum += buf[i];
  float meanV = sum / (float)n;
  if (isA && benchCode == 0) {
    vRef = meanV;
    haveRef = true;
  }
  float attOfMean = -20.0f * log10f(meanV / vRef);
  float attSum = 0;
  float attMin = 1e9f;
  float attMax = -1e9f;
  for (uint8_t i = 0; i < n; i++) {
    float att = -20.0f * log10f(buf[i] / vRef);
    attSum += att;
    if (att < attMin) attMin = att;
    if (att > attMax) attMax = att;
  }
  float attMean = attSum / (float)n;
  float acc = 0;
  for (uint8_t i = 0; i < n; i++) {
    float d = -20.0f * log10f(buf[i] / vRef) - attMean;
    acc += d * d;
  }
  float stdDb = sqrtf(acc / (float)n);
  float pp = attMax - attMin;
  bool noisy = pp > spreadLimitDb(benchCode);
  int32_t milli = (isA && benchCode == 0) ? 0 : roundMilli(attOfMean - (float)benchCode);
  if (isA) {
    errA[benchCode] = (int16_t)milli;
    markGot(gotA, benchCode);
    setFlag(noisyA, benchCode, noisy);
    sampCountA = 0;
  } else {
    errB[benchCode] = (int16_t)milli;
    markGot(gotB, benchCode);
    setFlag(noisyB, benchCode, noisy);
    sampCountB = 0;
  }
  Serial.print(F("AVG "));
  Serial.print(isA ? 'A' : 'B');
  Serial.print(' ');
  Serial.print(benchCode);
  Serial.print(' ');
  Serial.print(milli);
  Serial.print(F(" n "));
  Serial.print(n);
  Serial.print(F(" std "));
  Serial.print(roundMilli(stdDb));
  Serial.print(F(" pp "));
  Serial.print(roundMilli(pp));
  Serial.print(F(" min "));
  Serial.print(roundMilli(attMin - attMean));
  Serial.print(F(" max "));
  Serial.print(roundMilli(attMax - attMean));
  Serial.println(noisy ? F(" NOISY") : F(" CLEAN"));
}

static void pushSample(bool isA, float volts) {
  if (!benchArmed || !(volts > 0)) {
    Serial.println(F("ERR"));
    return;
  }
  if (isA) {
    if (benchCode != 0 && !haveRef) {
      Serial.println(F("ERR"));
      return;
    }
  } else if (!haveRef) {
    Serial.println(F("ERR"));
    return;
  }
  uint8_t nNeed = samplesForCode(benchCode);
  uint8_t *count = isA ? &sampCountA : &sampCountB;
  float *buf = isA ? sampA : sampB;
  buf[*count] = volts;
  (*count)++;
  if (*count < nNeed) {
    Serial.print(F("GOT "));
    Serial.print(isA ? 'A' : 'B');
    Serial.print(' ');
    Serial.print(*count);
    Serial.print('/');
    Serial.println(nNeed);
    return;
  }
  finishSamples(isA);
}

static bool anyNoisy() {
  for (uint8_t i = 0; i < CAL_CODES; i++) {
    if (flagAt(noisyA, i) || flagAt(noisyB, i)) return true;
  }
  return false;
}

static void printNoisy() {
  Serial.print(F("NOISY"));
  for (uint8_t i = 0; i < CAL_CODES; i++) {
    if (flagAt(noisyA, i)) {
      Serial.print(' ');
      Serial.print(i);
      Serial.print('A');
    }
    if (flagAt(noisyB, i)) {
      Serial.print(' ');
      Serial.print(i);
      Serial.print('B');
    }
  }
  Serial.println();
}

static bool parseVolts(const char *s, float *out) {
  while (*s == ' ') s++;
  char *end = nullptr;
  double volts = strtod(s, &end);
  if (end == s || !(volts > 0)) return false;
  *out = (float)volts;
  return true;
}

static void handleSpot(const char *s) {
  while (*s == ' ') s++;
  char *end = nullptr;
  long hz = strtol(s, &end, 10);
  if (end == s || hz <= 0) {
    Serial.println(F("ERR"));
    return;
  }
  s = end;
  while (*s == ' ') s++;
  long mv = strtol(s, &end, 10);
  if (end == s || mv <= 0) {
    Serial.println(F("ERR"));
    return;
  }
  s = end;
  while (*s == ' ') s++;
  char ch = *s;
  if (ch != 'A' && ch != 'B') {
    Serial.println(F("ERR"));
    return;
  }
  s++;
  while (*s == ' ') s++;
  long code = strtol(s, &end, 10);
  if (end == s || code < 0 || code > CAL_LAST) {
    Serial.println(F("ERR"));
    return;
  }
  s = end;
  while (*s == ' ') s++;
  long spot = strtol(s, &end, 10);
  if (end == s || spot < -20000 || spot > 20000) {
    Serial.println(F("ERR"));
    return;
  }
  if (!flagAt(ch == 'A' ? gotA : gotB, (uint8_t)code)) {
    Serial.println(F("ERR"));
    return;
  }
  int16_t table = (ch == 'A') ? errA[code] : errB[code];
  long delta = spot - (long)table;
  bool flag = delta > 100 || delta < -100;
  Serial.print(F("SPOT "));
  Serial.print(hz);
  Serial.print(' ');
  Serial.print(mv);
  Serial.print(' ');
  Serial.print(ch);
  Serial.print(' ');
  Serial.print(code);
  Serial.print(F(" table "));
  Serial.print(table);
  Serial.print(F(" spot "));
  Serial.print(spot);
  Serial.print(F(" delta "));
  Serial.print(delta);
  Serial.println(flag ? F(" FLAG") : F(" OK"));
}

static void dumpTable() {
  Serial.print(F("CAL "));
  Serial.println(calibrated ? 1 : 0);
  for (uint8_t i = 0; i < CAL_CODES; i++) {
    Serial.print(F("A "));
    Serial.print(i);
    Serial.print(' ');
    Serial.println(errA[i]);
  }
  for (uint8_t i = 0; i < CAL_CODES; i++) {
    Serial.print(F("B "));
    Serial.print(i);
    Serial.print(' ');
    Serial.println(errB[i]);
  }
  Serial.println(F("END"));
}

static void handleLine(char *text) {
  while (*text == ' ') text++;
  if (*text == 0) return;
  char cmd = text[0];
  const char *args = text + 1;

  if (cmd == 'G') {
    long code = strtol(args, nullptr, 10);
    if (code < 0 || code > CAL_LAST) {
      Serial.println(F("ERR"));
      return;
    }
    benchHold = true;
    benchArmed = true;
    benchCode = (uint8_t)code;
    sampCountA = 0;
    sampCountB = 0;
    setChannel(true, (uint8_t)code);
    setChannel(false, (uint8_t)code);
    attA = (uint8_t)code;
    attB = (uint8_t)code;
    Serial.print(F("OK "));
    Serial.print(code);
    Serial.print(F(" N "));
    Serial.println(samplesForCode(benchCode));
    return;
  }

  if (cmd == 'N') {
    while (*args == ' ') args++;
    if (*args == 0 || strcmp(args, "auto") == 0) {
      sampleOverride = -1;
      sampCountA = 0;
      sampCountB = 0;
      Serial.println(F("N auto"));
      return;
    }
    char *end = nullptr;
    long n = strtol(args, &end, 10);
    if (end == args || n < 1 || n > SAMPLE_CAP) {
      Serial.println(F("ERR"));
      return;
    }
    sampleOverride = (int8_t)n;
    sampCountA = 0;
    sampCountB = 0;
    Serial.print(F("N "));
    Serial.println(n);
    return;
  }

  if (cmd == 'V' && (args[0] == 'A' || args[0] == 'B')) {
    float volts = 0;
    if (!parseVolts(args + 1, &volts)) {
      Serial.println(F("ERR"));
      return;
    }
    pushSample(args[0] == 'A', volts);
    return;
  }

  if (cmd == 'P') {
    handleSpot(args);
    return;
  }

  if (cmd == 'A' || cmd == 'B') {
    long code = 0;
    long milli = 0;
    if (!parseTwoInts(args, &code, &milli) || code < 0 || code > CAL_LAST ||
        milli < -20000 || milli > 20000) {
      Serial.println(F("ERR"));
      return;
    }
    if (cmd == 'A') {
      errA[code] = (int16_t)milli;
      markGot(gotA, (uint8_t)code);
      setFlag(noisyA, (uint8_t)code, false);
    } else {
      errB[code] = (int16_t)milli;
      markGot(gotB, (uint8_t)code);
      setFlag(noisyB, (uint8_t)code, false);
    }
    Serial.print(cmd);
    Serial.print(' ');
    Serial.print(code);
    Serial.print(' ');
    Serial.println(milli);
    return;
  }

  if (cmd == 'W') {
    if (!allGot(gotA) || !allGot(gotB)) {
      Serial.println(F("MISSING"));
      return;
    }
    bool forceNoisy = args[0] == '!';
    if (!forceNoisy && anyNoisy()) {
      printNoisy();
      return;
    }
    saveTable();
    benchHold = false;
    forceCodes = true;
    if (!activateTable()) {
      calibrated = false;
      Serial.println(F("ERR"));
      return;
    }
    Serial.println(F("WROTE"));
    return;
  }

  if (cmd == 'Z') {
    EEPROM.update(EE_MAGIC, 0xFF);
    calibrated = false;
    benchHold = false;
    forceCodes = true;
    disableCalPwm();
    digitalWrite(PIN_INVERT, LOW);
    Serial.println(F("CLEARED"));
    return;
  }

  if (cmd == 'U') {
    benchHold = false;
    forceCodes = true;
    Serial.println(F("RUN"));
    return;
  }

  if (cmd == 'R') {
    dumpTable();
    return;
  }

  Serial.println(F("ERR"));
}

static void pollSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      line[lineLen] = 0;
      handleLine(line);
      lineLen = 0;
      continue;
    }
    if (lineLen < sizeof(line) - 1) line[lineLen++] = c;
  }
}

static void loopAnalog() {
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
  if (wantA != attA && (wA <= ISOLATION || forceCodes)) {
    setChannel(true, wantA);
    attA = wantA;
  }
  if (wantB != attB && (wB <= ISOLATION || forceCodes)) {
    setChannel(false, wantB);
    attB = wantB;
  }
  forceCodes = false;

  currentN = n;
  writeStaircase(n);
  digitalWrite(PIN_INVERT, (n & 1) ? HIGH : LOW);
}

static void loopCalibrated() {
  if (segCount == 0) return;
  float gr = readGrDb();
  if (gr < 0) gr = 0;
  if (gr > MAX_GR_DB) gr = MAX_GR_DB;

  int raw = applyHyst(findSegment(gr), gr);
  currentSeg = raw;
  const Seg &s = segs[raw];
  float kFar = kFarFor(s, gr);
  float kB = s.nearIsA ? kFar : (1.0f - kFar);
  float wA = 1.0f - kB;
  float wB = kB;
  uint8_t wantA = s.nearIsA ? s.nearCode : s.farCode;
  uint8_t wantB = s.nearIsA ? s.farCode : s.nearCode;

  if (wantA != attA && (wA <= ISOLATION || forceCodes)) {
    setChannel(true, wantA);
    attA = wantA;
  }
  if (wantB != attB && (wB <= ISOLATION || forceCodes)) {
    setChannel(false, wantB);
    attB = wantB;
  }
  forceCodes = false;

  writeVk(kB);
  digitalWrite(PIN_INVERT, LOW);
}

void setup() {
  pinMode(PIN_INVERT, OUTPUT);
  digitalWrite(PIN_INVERT, LOW);
  pinMode(PIN_VK_PWM, OUTPUT);
  digitalWrite(PIN_VK_PWM, LOW);
  setupPwm62k();
  Serial.begin(115200);

  if (loadTable()) activateTable();

  Wire.begin();
  delay(200);
  unmute();
  if (calibrated && segCount > 0) {
    const Seg &s = segs[0];
    uint8_t a = s.nearIsA ? s.nearCode : s.farCode;
    uint8_t b = s.nearIsA ? s.farCode : s.nearCode;
    setChannel(true, a);
    setChannel(false, b);
    attA = a;
    attB = b;
  } else {
    setChannel(true, 0);
    setChannel(false, 1);
    attA = 0;
    attB = 1;
  }
  currentN = 0;
  writeStaircase(0);
  inited = true;
}

void loop() {
  pollSerial();
  if (!inited || benchHold) return;
  if (calibrated) loopCalibrated();
  else loopAnalog();
}
