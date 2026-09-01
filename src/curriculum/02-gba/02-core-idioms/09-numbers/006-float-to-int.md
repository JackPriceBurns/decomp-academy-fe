---
id: 8aaec5de-862e-435f-859b-cee4554b0f07
slug: gba-numbers-float-to-int
title: Converting Out
difficulty: 2
concepts:
  - floating-point
  - conversions
  - soft-float
symbol: func_08295fbc
hints:
  - The last helper before the epilogue is the one that decides what type comes
    back. Everything before it happened in floats.
  - "Two `f32` in, an `s32` out — the cast is applied to the product, not to
    either operand."
---

# Truncation, always

Going the other way is `__fixsfsi`: **fix** a **s**ingle **f**loat into a
**s**igned **i**nt. "Fix" is old numerical-analysis vocabulary for converting
to a fixed-point representation, and integers are just fixed point with no
fractional bits.

```asm
0        push      {lr}
2        bl        __fixsfsi-4
6        pop       {r1}
8        bx        r1
```

The helper truncates toward zero. Always. There is no rounding mode to set, no
alternative entry point, and C requires exactly this behaviour: 2.9 becomes 2,
and -2.9 becomes -2. If the original programmer wanted rounding they had to
build it themselves, and the usual way is visible in the assembly:

```asm
0        push      {lr}
2        ldr       r1, [pc, #12] (->16)
4        bl        __addsf3-4
8        bl        __fixsfsi-4
12       pop       {r1}
14       bx        r1
16       .word     1056964608
```

1056964608 is 0x3F000000, which is 0.5f. Add a half and then truncate and you
have rounded to nearest — for positive values. For negative ones this rounds
the wrong way, which is the kind of asymmetry that shows up as a one-pixel
jitter once a coordinate crosses zero.

Notice what the epilogue does **not** tell you here. Both of these return one
word, so both pop into `r1`, and the interwork return looks identical whether
the value is an `s32` or an `f32`. When the return type is in question, the
tell is the last helper called: end on `__fixsfsi` and an integer comes back;
end on `__floatsisf` and a float does.

Your target ends on a conversion too. Read what happened before it.

## Your task

Write `func_08295fbc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08295fbc(f32 a, f32 b) {
    return (s32)(a * b);
}
```
