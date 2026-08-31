---
id: 8f271e24-540f-40e1-ab6c-2169a477ca36
slug: arithmetic-capstone-mul-mod
title: "Capstone: Product, Wrapped"
difficulty: 4
concepts:
  - arithmetic
  - multiply
  - divide
  - hi-lo
  - capstone
symbol: func_803c9c78
hints:
  - "Two HI/LO rituals back to back — the first fetches LO, the second fetches HI. Name each one's C operator, then compose them."
  - "An instruction sitting between `multu` and its `mflo` isn't part of the multiply — the scheduler slid it up to hide latency. Read around it."
---

# Two trips through HI/LO

A product feeding a remainder means the multiply unit and the divide unit run
back to back — two rituals, one expression. Here's the unsigned warm-up,
`(p * q) % 16` on `u32`s, where the remainder is cheap:

```asm
multu a0, a1        # HI:LO = p * q
mflo  v0            # the product
andi  t6, v0, 0xf   # % 16 — power of two, so just a mask
or    v0, t6, zero  # copy into the return register
jr    ra
nop
```

Product, mask, done — the pow-2 remainder never touches the divider. (That
final `or` from `zero` is the register copy you met in warmup, shuffling the
result home.)

The target below is the signed cousin with a divisor that is *not* a power of
two, so the second ritual is a real `div` — divisor in `at`, fetch from HI.
Two reading notes for the road:

- **The scheduler interleaves.** IDO slides independent instructions into the
  multiply's latency shadow, so expect to find something useful parked between
  `multu` and `mflo` — in the target, the divisor's `addiu`. It belongs to the
  *next* operation; don't let its position confuse the decode.
- **Only one guard-free path.** The target fetches just one result from its
  division, so it's the tidy `at` form — no `break` safety net to transcribe.

Decode each ritual, join them with the right operator, and mind your types:
every `multu` you've seen is normal for signed products, but check what the
divide mnemonic says.

## Your task

Write `func_803c9c78` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803c9c78(s32 a, s32 b) {
    return a * b % 100;
}
```
