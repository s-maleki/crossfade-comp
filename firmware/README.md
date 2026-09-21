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
input side of the PT2257. The Nano has no tap ADC. Unplug the pedal output.
Inject about 200 mVrms at 1 kHz. Meter VA and VB (U1B / U1C) and type the
volts in. The sketch averages them.

At code 30 the channel output is about 6 mV, and at code 40 about 2 mV.
A single meter reading there is the noise floor, not the ladder. `G`
replies with how many readings to take:

| Codes | Readings |
|------:|---------:|
| 0–15  | 8        |
| 16–24 | 16       |
| 25–41 | 32       |

`N 16` forces one count for every code (1–32). `N auto` restores the
schedule. Changing `N` drops a half-finished series.

Serial is 115200, one command per line.

| Command | Effect |
|---------|--------|
| `G <code>` | Both channels to this code, 0–41. Leapfrog freezes. Reply is `OK <code> N <count>`. |
| `VA <volts>` | One RMS reading of VA. The count-th sample stages the mean. |
| `VB <volts>` | Same for VB. Code 0 on A must finish first; that mean is the reference. |
| `A <code> <milli>` | Stage a hand-computed error. No spread is recorded, so a noisy code is cleared. Prefer `VA`. |
| `B <code> <milli>` | Same for channel B. |
| `P <Hz> <mV> <A\|B> <code> <milli>` | Compare a spot reading to the staged error. Never writes the table. |
| `W` | Store once every code is staged and none were `NOISY`. The next loop rewrites both taps once, then only the idle tap. |
| `W!` | Store anyway. The noisy means go into EEPROM. |
| `R` | Dump the staged table and whether EEPROM is valid. |
| `Z` | Clear the EEPROM magic and return to the analog path. |
| `U` | Leave bench hold without writing. |

Do code 0 on A before anything else. Both channels use that mean as VA(0):

```
att = -20 log10(mean(V) / VA(0))
milli = round(1000 * (att - code))
```

The mean is of the volts, then one conversion to dB. When the series
completes the line looks like:

```
AVG A 35 -120 n 32 std 80 pp 250 min -120 max 130 NOISY
```

`std`, `pp`, `min`, and `max` are millidB of the sample cloud (`min`/`max`
are offsets from the mean of the sample attenuations). `pp` is
peak-to-peak.

| Codes | CLEAN if pp is at most | NOISY means |
|------:|-----------------------:|-------------|
| 0–15  | 50 millidB (0.05 dB)   | The signal is large. A wider cloud is a connector, a ground loop, or a meter that has not settled. Reseat, shorten the leads, and repeat the code. |
| 16–24 | 100 millidB (0.10 dB)  | Same, with a little more room. |
| 25–41 | 200 millidB (0.20 dB)  | The tap is a few millivolts. 0.20 dB across 32 samples is about 0.035 dB on the mean, inside the 0.05 dB law budget. Wider than that, the mean is the noise. Shield the leads or raise the generator only for a look — do not file that louder pass into the table. |

`W` refuses while any code is still `NOISY` and prints `NOISY 35A 40B`.
Repeat those codes until they say `CLEAN`. `W!` stores the noisy means if
you mean to. `A`/`B` clear the flag without a spread; use them only when
the average was taken outside the Nano and you accept that.

`A 0` is 0. `B 0` is the open-tap channel offset, in millidB. After `W`,
move the Vk jumper to D9. D9 is 10-bit PWM, 0–5 V = mix weight of channel
B. D2 stays low. `Z` requires the jumper back on U5B.

The runtime map uses the measured anchors. A code on the idle channel that
is not strictly more attenuated than the live tap is skipped. k is the
exact amplitude fraction between the two measured taps. A channel is still
rewritten only while its mix weight is under 2 %.

Spot check, once
----------------

Run this on one prototype, not on every board. The table that gets stored
is the 1 kHz / 200 mVrms pass. The question is whether that row still
describes the ladder at another frequency and another level, because the
sidechain is broadband and the guitar is not 200 mV.

Re-measure codes 5, 15, 25, 35, and 40, both channels, at:

- 100 Hz, 200 mVrms
- 5 kHz, 200 mVrms
- 1 kHz, 2.0 Vrms (under the 2.3 Vrms THD ceiling)

Same `G` / `VA` / `VB` averaging if you want a clean number, but do **not**
`W` those readings. Send the resulting millidB with `P`:

```
P 100 200 A 15 -80
P 5000 200 A 35 -40
P 1000 2000 B 40 -200
```

The reply is `SPOT ... delta <milli> OK` or `FLAG`. The gate is 100 millidB
(0.10 dB). That is twice the ~0.05 dB measurement budget, so ordinary meter
scatter stays `OK`, and it is above the 0.057 dB mix residual of a skipped
2 dB span, so a `FLAG` is the table, not the interpolator. A flag does not
change EEPROM. If a code flags, the 1 kHz / 200 mV row stays, and that
code's error depends on frequency or level. A single-condition table does
not remove it.

Build
-----

Open the `.ino` in Arduino IDE, board = Arduino Nano, 328P. No libraries
beyond `Wire`.
