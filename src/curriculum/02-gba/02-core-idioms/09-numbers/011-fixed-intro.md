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
  - "Two `s32` in, an `s32` out. One argument arrives in Q4 and has to reach
    Q8; the other is a whole number; and 128 is one half in Q8."
---

# A binary point you keep in your head

A Q8.8 number is an ordinary `s32`. Nothing marks it, nothing checks it, no
instruction treats it differently. You simply agree with yourself that the
value has been multiplied by 256, so the low eight bits hold a fraction:

    256 -> 1.0        128 -> 0.5        64 -> 0.25        1 -> 1/256

The "Q8" names the eight fractional bits. Q4 keeps four (16 is 1.0), Q12
keeps twelve (4096 is 1.0). Choosing one is choosing where to spend your 32
bits: more fractional bits means finer steps and a smaller range before
overflow.

Moving in and out of the format is one instruction each way. Entering is a
left shift by the number of fractional bits; leaving is a **right shift that
must be arithmetic**, because the value is signed and `asr` preserves the sign
bit while `lsr` would turn -1 into two billion. Converting between two Q
formats is a shift by the difference.

Here is a Q12 value being combined with a whole number:

```asm
0        lsl       r0, #12
2        add       r0, r1
4        ldr       r1, [pc, #4] (->12)
6        add       r0, r1
8        bx        lr
```

The `lsl #12` lifts a plain integer into Q12. The interesting line is the pool
load: the source subtracted 2048, which is one half in Q12, and 2048 does not
fit in Thumb's 8-bit `sub` immediate. So gcc fetched the constant from the
literal pool — as **4294965248**, which is 0xFFFFF800, which is -2048 — and
turned the subtraction into an addition of a negative number. Pool words are
printed unsigned, so anything above two billion is worth re-reading as a small
negative.

Compare the whole thing to the float chapter you just finished. No frame, no
callee-saved registers, no calls, five instructions. This is why the games are
written this way.

Your target has two shifts and two adds. Each piece is doing one of the jobs
described above.

## Your task

Write `func_082ac500` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082ac500(s32 q4, s32 whole) {
    return (q4 << 4) + (whole << 8) + 128;
}
```
