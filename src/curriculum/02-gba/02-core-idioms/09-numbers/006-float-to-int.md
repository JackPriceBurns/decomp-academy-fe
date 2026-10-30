---
id: 8aaec5de-862e-435f-859b-cee4554b0f07
slug: gba-numbers-float-to-int
title: Converting a Float to an Integer
difficulty: 2
concepts:
  - floating-point
  - conversions
  - soft-float
symbol: func_08295fbc
hints:
  - The last helper before the epilogue decides what type comes back.
    Everything before it was done in floats.
  - "Two `f32` in, an `s32` out. The cast applies to the product. Neither
    operand is cast on its own."
---

# It always truncates

The conversion in the other direction is `__fixsfsi`: **fix** a **s**ingle
**f**loat into a **s**igned **i**nt. "Fix" is an old term from numerical
analysis. It means converting to a fixed-point representation, and an integer
is fixed point with no fractional bits.

```asm
0        push      {lr}
2        bl        __fixsfsi-4
6        pop       {r1}
8        bx        r1
```

The helper always truncates toward zero. There is no rounding mode to set and
no other entry point, and C requires exactly this behaviour: 2.9 becomes 2,
and -2.9 becomes -2. If the original programmer wanted rounding, they had to
write it themselves. The usual way looks like this in the assembly:

```asm
0        push      {lr}
2        ldr       r1, [pc, #12] (->16)
4        bl        __addsf3-4
8        bl        __fixsfsi-4
12       pop       {r1}
14       bx        r1
16       .word     1056964608
```

The pool word 1056964608 is 0x3F000000, which is 0.5f. Adding a half and then
truncating rounds to the nearest integer, but only for positive values. For
negative values it rounds the wrong way. That difference can show up as a
one-pixel jitter when a coordinate crosses zero.

Notice what the epilogue does **not** tell you here. Both of these functions
return one word, so both pop into `r1`. The interwork return looks the same
whether the value is an `s32` or an `f32`. When you are unsure of the return
type, look at the last helper called. If it is `__fixsfsi`, an integer comes
back. If it is `__floatsisf`, a float comes back.

Your target also ends with a conversion. Read what happens before it.

## Your task

Write `func_08295fbc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08295fbc(f32 a, f32 b) {
    return (s32)(a * b);
}
```
