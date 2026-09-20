BlendStep firmware
==================

`leapfrog_pt2257.ino` is an Arduino Nano sketch. It does **not** process audio
and it does **not** compute attack, release, threshold, or ratio. Those are analog.

It does three things:

1. Read `VGR` (100 mV/dB analog bus from the control-law board) on A2.
2. Keep PT2257 left/right programmed to adjacent taps, rewriting only the
   channel whose analog mix weight is under 2 %.
3. Output the integer-dB staircase `VN` as 62.5 kHz PWM on D3, plus a phase
   bit on D2 so the analog Vk inverter can triangle through odd 1 dB intervals.

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

PT2257 VDD is +9 V. 5 V I²C is still a legal HIGH.

Build
-----

Open the `.ino` in Arduino IDE, board = Arduino Nano, 328P. No libraries
beyond `Wire`.
