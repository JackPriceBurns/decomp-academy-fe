---
id: 6ef10c50-fa0e-4fb8-843d-2edf6942399e
slug: gba-numbers-fixed-intro
title: The Fixed-Point Answer
difficulty: 2
concepts:
  - fixed-point
  - shifts
  - constants
symbol: func_082ac500
hints:
  - Two different shift amounts on two different registers, then a constant.
    Ask what each shift does to the position of the binary point.
  - "Two `s32` in, an `s32` out. One argument arrives in Q4 and has to be moved
    to Q8. The other is a whole number. In Q8, 128 is one half."
---

# The binary point is a convention

A Q8.8 number is an ordinary `s32`. Nothing marks it or checks it, and no
instruction treats it differently. You decide that the value has been
multiplied by 256, so the low eight bits hold a fraction:

    256 -> 1.0        128 -> 0.5        64 -> 0.25        1 -> 1/256

The "Q8" means eight fractional bits. Q4 has four (16 is 1.0), and Q12 has
twelve (4096 is 1.0). Choosing a format means choosing how to split your 32
bits. More fractional bits give finer steps but a smaller range before
overflow.

Converting into or out of the format takes one instruction each way. To
convert in, shift left by the number of fractional bits. To convert out, use a
**right shift that must be arithmetic**. The value is signed, and `asr` keeps
the sign bit, while `lsr` would turn -1 into two billion. To convert between
two Q formats, shift by the difference in fractional bits.

Here a Q12 value is combined with a whole number:

```asm
0        lsl       r0, #12
2        add       r0, r1
4        ldr       r1, [pc, #4] (->12)
6        add       r0, r1
8        bx        lr
```

The `lsl #12` converts a plain integer into Q12. Look closely at the pool load.
The source subtracted 2048, which is one half in Q12, but 2048 does not fit in
Thumb's 8-bit `sub` immediate. So gcc loaded the constant from the literal pool
and turned the subtraction into an addition of a negative number. The pool word
is **4294965248**, which is 0xFFFFF800, or -2048. Pool words are printed as
unsigned numbers, so read anything above two billion again as a small negative
number.

Compare this with the float lessons you just finished. There is no frame, no
callee-saved register and no call, only five instructions. This is why the
games were written this way.

Your target has two shifts and two adds. Each one does one of the jobs
described above.

## Your task

Write `func_082ac500` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082ac500(s32 q4, s32 whole) {
    return (q4 << 4) + (whole << 8) + 128;
}
```
