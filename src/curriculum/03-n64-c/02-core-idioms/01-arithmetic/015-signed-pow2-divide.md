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
  - "The shift amount on the `sra` is the exponent, and the bias on the `addiu` is one less than the divisor. Check they agree, then write one division."
  - "Your C is a single signed division — the branch, both shifts, and the bias all come out of it automatically."
---

# Why signed can't just shift

Shifting right rounds *downward* — toward negative infinity. C division
truncates *toward zero*. For positive values those agree, but for negative
ones they differ by one: `-9 >> 3` is `-2`, while C says `-9 / 8` is `-1`.
So the compiler shifts anyway, and patches the negative case: **bias the
input by divisor−1 first**, which bumps any negative value with a remainder
up to the next multiple. Here's `s32 x / 8`:

```asm
 0:  bgez  a0, 0x10      # x >= 0?  skip the fix-up
 4:  sra   v0, a0, 3     # (delay slot) v0 = x >> 3 — runs either way
 8:  addiu at, a0, 7     # negative path: bias by 8-1
 c:  sra   v0, at, 3     # v0 = (x + 7) >> 3
10:  jr    ra
14:  nop
```

Three new pieces, all load-bearing:

- **`sra`** — shift right *arithmetic*. Where `srl` fills with zeros, `sra`
  copies the sign bit in, keeping negatives negative. Signed values shift with
  `sra`; that mnemonic alone tells you the type.
- **`bgez`** — **b**ranch if **g**reater than or **e**qual to **z**ero. If
  `a0` is non-negative, execution jumps to address `0x10`, the return.
- **The delay slot is working now.** The `sra` at address `4` sits in the
  branch's shadow, so it executes *whether or not the branch is taken*. For
  positive x, that shift already computed the right answer and the branch skips
  the rest. For negative x, it computed a wrong answer that lines `8`–`c`
  immediately overwrite. Wasteful-looking, but branchless-fast for the common
  path — and a pure compiler fingerprint you get for free.

The entire six-line dance comes from a one-line C division. To decode one:
read the divisor off the `sra` amount (2^k), sanity-check it against the bias
(divisor−1), done.

## Your task

Write `func_80145a1c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80145a1c(s32 a) {
    return a / 4;
}
```
