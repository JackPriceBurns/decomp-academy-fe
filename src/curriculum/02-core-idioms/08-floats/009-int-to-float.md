---
id: floats-int-to-float
title: "Integer to Float: The Magic-Number Trick"
difficulty: 3
concepts:
  - floating-point
  - conversion
  - int-to-float
symbol: i2f
hints:
  - int→float has no single instruction; MWCC uses the 0x43300000 magic-number
    trick.
  - Just write `(f32)x` and let the compiler emit the xoris/lfd/stw/fsubs
    sequence.
---

# There is no plain "int → float" instruction

PowerPC's only integer/float conversion hardware is `fctiwz` (float → int). To go
the *other* way, MWCC uses a famous bit-twiddling trick. It builds a double whose
bit pattern is `0x43300000:(n ^ 0x80000000)` and then subtracts the matching bias
constant `0x4330000000000000`, leaving the integer value as a float. Here is what
that looks like for a function `int_to_single(int n)`:

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

PowerPC is **big-endian**, so the high word sits at the *lower* address: `8(r1)`
holds `0x43300000` and `12(r1)` holds `n ^ 0x80000000`. The two `stw`s together
lay down the 8-byte double `0x43300000:(n ^ 0x80000000)`, which `lfd f0, 8(r1)`
then reads back.

You don't write any of this manually. When you see the
`xoris … 0x4330 … lfd … stw/stw … lfd … fsubs` pattern in disassembly, that's the
signature of an integer-to-float conversion in C. A single C operator produces
the whole sequence.

## Your task

Write `i2f` taking an `int x` to reproduce the assembly above.

<!-- starter -->
```c
f32 i2f(int x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 i2f(int x) {
    return (f32)x;
}
```
