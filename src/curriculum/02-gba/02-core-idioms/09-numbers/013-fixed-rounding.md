---
id: 65c8eeb3-e9f5-4e05-8f16-9ef0a4d28ccf
slug: gba-numbers-fixed-rounding
title: Rounding a Fixed-Point Result
difficulty: 4
concepts:
  - fixed-point
  - rounding
  - signed-shift
symbol: func_082b53e8
hints:
  - 383 is two biases added together — the one the source asked for and the one
    the compiler adds for a signed division. Subtract 255 to recover the first.
  - "Two `s32` in, an `s32` out. The scale-down is written as a division rather
    than a shift, which is what brings the compiler's own bias into it, and the
    rounding term is half of that divisor."
---

# Two biases meet in the pool

An arithmetic right shift throws the fractional bits away, which means it
always rounds **down** — toward negative infinity. Adding half a unit first
turns that into rounding to nearest:

```asm
0        mul       r0, r1
2        add       r0, #8
4        asr       r0, #4
6        bx        lr
```

A Q4 product shifted down by 4, with 8 added first because 8 is half of 16.
For Q8 the bias would be 128, for Q12 it would be 2048. One extra instruction
buys you a result that is off by at most half a unit instead of always low.

Now write the same scale-down as a division and watch a second bias appear:

```asm
0        mul       r0, r1
2        cmp       r0, #0
4        bge       8 ~>
6        add       r0, #15
8      ~>asr       r0, #4
10       bx        lr
```

This is the pattern from the division chapter. C requires `/` to truncate
toward zero, `asr` rounds toward negative infinity, and the two disagree for
negative values — so gcc adds 2^n - 1 first, but only when the value is
negative, which is what the `cmp` and `bge` are for. `>> 4` and `/ 16` are the
same instruction for positive numbers and different code entirely once a sign
is possible.

Put both biases in one expression and they meet. The bias the source wrote is a
constant, the compiler's sign fix-up is a constant, and on the negative path
both are added to the same product — so gcc adds them together at compile time
and fetches the sum. The positive path still carries the bias your C contains as
a plain immediate; the negative path gets the combined number, and since Thumb's
`add` immediates stop at 255 that number arrives from the literal pool.

That fold is the whole lesson. When a fixed-point listing shows a bias you
cannot account for, check whether it is a sum of two — and your target's pool
word is exactly that. Work back from it to the constant the source contained.

## Your task

Write `func_082b53e8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082b53e8(s32 a, s32 b) {
    return (a * b + 128) / 256;
}
```
