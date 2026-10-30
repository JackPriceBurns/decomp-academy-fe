---
id: b51687ca-b8fa-41c2-be11-7e9838264c32
slug: arithmetic-signed-pow2-divide
title: Signed Powers of Two Need a Fix-Up
difficulty: 3
concepts:
  - arithmetic
  - divide
  - shifts
  - delay-slots
  - fingerprints
symbol: func_80145a1c
hints:
  - "The shift amount on the `sra` is the exponent, and the bias on the `addiu` is one less than the divisor. Check that they agree, then write one division."
  - "Your C is a single signed division. The compiler produces the branch, both shifts and the bias from it on its own."
---

# Why signed values can't just shift

Shifting right rounds *down*, toward negative infinity. C division rounds
*toward zero*. For positive values these give the same result, but for
negative values they differ by one: `-9 >> 3` is `-2`, while in C `-9 / 8` is
`-1`. So the compiler still shifts, but it fixes the negative case: **it adds
a bias of divisor−1 to the input first**. This moves any negative value that
has a remainder up to the next multiple. Here's `s32 x / 8`:

```asm
 0:  bgez  a0, 0x10      # x >= 0?  skip the fix-up
 4:  sra   v0, a0, 3     # (delay slot) v0 = x >> 3, runs either way
 8:  addiu at, a0, 7     # negative path: bias by 8-1
 c:  sra   v0, at, 3     # v0 = (x + 7) >> 3
10:  jr    ra
14:  nop
```

This listing has three new pieces:

- **`sra`** means shift right *arithmetic*. Where `srl` fills with zeros,
  `sra` copies the sign bit in, so negative values stay negative. Signed
  values shift with `sra`, so this mnemonic alone tells you the type.
- **`bgez`** means **b**ranch if **g**reater than or **e**qual to **z**ero. If
  `a0` is non-negative, execution jumps to address `0x10`, the return.
- **The delay slot now does real work.** The `sra` at address `4` is in the
  branch's delay slot, so it runs *whether or not the branch is taken*. For
  positive x, that shift already gives the right answer, and the branch skips
  the rest. For negative x, it gives a wrong answer, which lines `8` to `c`
  then overwrite. This looks wasteful, but the common path stays short and
  fast. It is also a pure compiler fingerprint that you never write yourself.

All six lines come from a one-line C division. To decode one, read the divisor
from the `sra` amount (2^k), and check it against the bias (divisor−1). That
is all you need.

## Your task

Write `func_80145a1c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80145a1c(s32 a) {
    return a / 4;
}
```
