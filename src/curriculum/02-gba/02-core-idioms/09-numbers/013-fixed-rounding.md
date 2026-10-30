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
  - "383 is two biases added together: the one the source asked for and the one
    the compiler adds for a signed division. Subtract 255 to get the first one
    back."
  - "Two `s32` in, an `s32` out. The scale-down is written as a division
    instead of a shift. That is what brings in the compiler's own bias. The
    rounding term is half of that divisor."
---

# Two biases combined in the pool

An arithmetic right shift discards the fractional bits, so it always rounds
**down**, toward negative infinity. If you add half a unit first, it rounds to
the nearest value instead:

```asm
0        mul       r0, r1
2        add       r0, #8
4        asr       r0, #4
6        bx        lr
```

This is a Q4 product shifted down by 4. It adds 8 first, because 8 is half
of 16. For Q8 the bias would be 128, and for Q12 it would be 2048. For one
extra instruction, the result is off by at most half a unit, instead of always
being too low.

Now write the same scale-down as a division, and a second bias appears:

```asm
0        mul       r0, r1
2        cmp       r0, #0
4        bge       8 ~>
6        add       r0, #15
8      ~>asr       r0, #4
10       bx        lr
```

This is the pattern from the division chapter. C requires `/` to truncate
toward zero, but `asr` rounds toward negative infinity. The two give different
results for negative values. So gcc adds 2^n minus 1 first, but only when the
value is negative. That is what the `cmp` and `bge` are for. For positive
numbers, `>> 4` and `/ 16` are the same instruction. Once the value can be
negative, they compile to different code.

If you put both biases in one expression, gcc combines them. The bias the
source wrote is a constant, and the compiler's sign correction is also a
constant. On the negative path, both are added to the same product. So gcc adds
the two together at compile time and loads the sum. The positive path still
adds the bias from your C as a plain immediate. The negative path gets the
combined number. Thumb's `add` immediates only go up to 255, so that number is
loaded from the literal pool.

That combining step is the main point of this lesson. When a fixed-point
listing shows a bias you cannot explain, check whether it is the sum of two
biases. Your target's pool word is exactly that. Work back from it to the
constant in the source.

## Your task

Write `func_082b53e8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082b53e8(s32 a, s32 b) {
    return (a * b + 128) / 256;
}
```
