---
id: d47312ea-8c9d-5754-a5cf-83ad7ef2e401
slug: floats-int-to-float
title: "Integer to Float: The Magic-Number Trick"
difficulty: 3
concepts:
  - floating-point
  - conversion
  - int-to-float
symbol: func_8011cc48
hints:
  - int→float has no single instruction; MWCC uses the 0x43300000 magic-number
    trick.
  - Just write `(f32)x` and let the compiler emit the xoris/lfd/stw/fsubs
    sequence.
---

# There is no plain "int → float" instruction

PowerPC's only integer/float conversion hardware is `fctiwz` (float → int). To
go the other way, MWCC uses a famous bit-twiddling trick: it builds a double
with bit pattern `0x43300000:(n ^ 0x80000000)` and subtracts the matching bias
constant `0x4330000000000000`, leaving the integer value as a float. Here's
what that looks like for `int_to_single(int n)`:

```asm
xoris r3, r3, 0x8000   # flip the sign bit (handle signedness)
lis   r0, 0x4330       # high half of the magic double
lfd   f1, ...          # load the bias constant 0x4330000000000000
stw   r3, 12(r1)       # assemble 0x43300000:(n ^ 0x80000000) on the stack
stw   r0, 8(r1)
lfd   f0, 8(r1)        # reload it as a double
fsubs f1, f0, f1       # subtract the bias → the converted value
blr
```

PowerPC is big-endian, so the high word sits at the lower address: `8(r1)`
holds `0x43300000` and `12(r1)` holds `n ^ 0x80000000`. The two `stw`s together
lay down the 8-byte double, which `lfd f0, 8(r1)` reads back.

You don't write this manually. When you see the `xoris … 0x8000`,
`lis 0x4330`, `lfd`, `stw/stw`, `lfd`, `fsubs` pattern, that's the signature of
an integer-to-float conversion in C. A single C operator produces the whole
sequence.

## Your task

Write `func_8011cc48` to reproduce the assembly above.

<!-- solution -->
```c
f32 func_8011cc48(int x) {
    return (f32)x;
}
```
