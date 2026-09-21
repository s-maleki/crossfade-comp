BlendStep firmware
==================

`leapfrog_pt2257.ino` is an Arduino Nano sketch. It does **not** process audio
and it does **not** compute attack, release, threshold, or ratio. Those are analog.

It does three things, plus an optional bench calibration:

1. Read `VGR` (100 mV/dB analog bus from the control-law board) on A2.
2. Keep PT2257 left/right programmed to adjacent taps, rewriting only the
   channel whose analog mix weight is under 2 %. A stored ladder table may
   skip a code that does not rise.
3. With blank EEPROM, output the integer-dB staircase `VN` as 62.5 kHz PWM
   on D3, plus a phase bit on D2 so the analog Vk inverter can triangle
   through odd 1 dB intervals. With a valid table, D9 is the mix weight of
   channel B and D2 stays low.
   D2 is **not** the Cgd neutralization invert. −Vgs is analog, from U2D on
   the interpolator. Do not wire D2 to CV1.

Wiring
------

| Nano | Destination          |
|------|----------------------|
| 5V   | I²C pull-ups, Nano   |
| GND  | analog ground        |
| A4   | PT2257 SDA           |
| A5   | PT2257 SCL           |
| A2   | VGR                  |
| D3   | VN filter (R82/C30)  |
| D2   | Vk invert analog switch |
| D9   | Calibrated Vk (R84/C32) |

PT2257 VDD is +9 V. 5 V I²C is still a legal HIGH.

D9 is unused until a ladder table is stored. Blank EEPROM keeps D3/D2 and
the analog U5 path. Jumper Vk to U5B, or to the D9 filter, not to both.

Calibration
-----------

GERR and CERR are static ladder ratios. Do not try to measure them at
startup: there is no tone source, and the sidechain rectifier is on the
input side of the PT2257. Unplug the pedal output. Inject about 200 mVrms
at 1 kHz. Meter VA and VB (U1B / U1C).

Serial is 115200, one command per line.

| Command              | Effect                                              |
|----------------------|-----------------------------------------------------|
| `G <code>`           | Both channels to this code, 0–41. Leapfrog freezes. |
| `A <code> <milli>`   | Stage channel A error, millidB                      |
| `B <code> <milli>`   | Stage channel B error, millidB                      |
| `W`                  | Store the table once every code is staged. The next loop rewrites both taps once, then only the idle tap. |
| `R`                  | Dump the staged table and whether EEPROM is valid   |
| `Z`                  | Clear the EEPROM magic and return to the analog path |
| `U`                  | Leave bench hold without writing                    |

Both channels are referenced to VA at code 0:

```
att = -20 log10(V / VA(0))
milli = round(1000 * (att - code))
```

`A 0` is 0. `B 0` is the open-tap channel offset, in millidB. After `W`,
move the Vk jumper to D9. D9 is 10-bit PWM, 0–5 V = mix weight of channel
B. D2 stays low. `Z` requires the jumper back on U5B.

The runtime map uses the measured anchors. A code on the idle channel that
is not strictly more attenuated than the live tap is skipped. k is the
exact amplitude fraction between the two measured taps. A channel is still
rewritten only while its mix weight is under 2 %.

Build
-----

Open the `.ino` in Arduino IDE, board = Arduino Nano, 328P. No libraries
beyond `Wire`.
