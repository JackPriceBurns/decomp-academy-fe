---
id: 8de38c7c-0328-4bf1-aef0-2d5e5af56c6f
slug: gba-types-narrow-argument
title: A Narrow Argument Arrives Wide
difficulty: 3
concepts:
  - narrow-types
  - calling-convention
  - sign-extension
symbol: func_081cd058
hints:
  - Two shift pairs at the very top, one on `r0` and one on `r1`, means both
    parameters are narrow - and the shift count gives the width while the second
    mnemonic gives the signedness.
  - "Two `u8` parameters, an `s32` result, and one subtraction between them."
---

# Cleaning up after the caller

An argument narrower than a word still travels in a whole 32-bit register. The
ABI makes no promise about the bits above the value, so a callee that cares
about them has to produce them itself. That is why so many agbcc functions open
with shifting before they do any work at all.

The pair is the same one you have been reading off loads, applied to a register
that is already in hand. Here a `u8` arrives as the second argument:

```asm
0        lsl       r1, #24
2        lsr       r1, #24
4        add       r0, r1
6        bx        lr
```

`lsl #24` throws away everything above bit 7, `lsr #24` brings the byte back
down with zeros on top, and only then is it added. Here is an `s16` arriving as
the first argument instead:

```asm
0        lsl       r0, #16
2        asr       r0, #16
4        add       r0, r1
6        bx        lr
```

Three things fall out of a leading pair, and you can read all of them at a
glance. The register says which parameter it is - `r0`, `r1`, `r2`, `r3` in
order. The shift count says how wide the type is, since the count is 32 minus
the width. The second mnemonic says the signedness: `lsr` fills with zeros for
an unsigned type, `asr` copies the sign bit for a signed one.

Parameters that are already 32 bits wide need none of this, so a leading shift
pair is the fingerprint of a narrow parameter. Count the pairs, note their
registers, and the signature writes itself.

Read the opening of your target the same way, register by register.

## Your task

Write `func_081cd058` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081cd058(u8 a, u8 b) {
    return a - b;
}
```
