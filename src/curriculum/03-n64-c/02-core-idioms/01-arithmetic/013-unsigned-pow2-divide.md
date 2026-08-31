---
id: 881ee9b1-ef04-4061-b493-f22f3cbcccf0
slug: arithmetic-unsigned-pow2-divide
title: Dividing Unsigned by a Power of Two
difficulty: 1
concepts:
  - arithmetic
  - divide
  - shifts
symbol: func_80207ba4
hints:
  - "A lone `srl` on an unsigned value is a division; the shift amount is the exponent."
  - "Count k, compute 2^k, and write the division by that constant."
---

# Division that vanishes

When the divisor is a power of two and the value is *unsigned*, division
collapses into a single instruction. `srl` — **s**hift **r**ight **l**ogical —
moves bits right, filling with zeros, and every place halves the value. Here's
a `u32` divided by 16:

```asm
srl  v0, a0, 4     # v0 = x >> 4  =  x / 16
jr   ra
nop
```

No `divu`, no HI/LO, no nops — the whole thing became one shift. Just as `sll`
by k multiplies by 2^k, `srl` by k divides by 2^k, discarding the remainder.
That's exactly what unsigned integer division means, so the shift *is* the
division, and IDO will never spend the slow divide unit on it.

When you decode one of these, you have a genuine C choice: `x / 16` and
`x >> 4` compile to identical output. For matching either is fine; pick
whichever reads like something the original programmer would write — division
for sizes and counts, shifts for bit manipulation.

The word *unsigned* is doing heavy lifting in this lesson. Try the same trick
on a signed value and negative inputs round the wrong way — the compiler knows
it, and emits a guarded fix-up you'll meet two lessons from now. A bare,
branchless `srl` is therefore itself a type clue: the value is unsigned.

## Your task

Write `func_80207ba4` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80207ba4(u32 a) {
    return a / 8;
}
```
