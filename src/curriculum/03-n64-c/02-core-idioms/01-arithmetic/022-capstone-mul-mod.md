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
  - "There are two HI/LO sequences, one after the other. The first fetches LO, and the second fetches HI. Name the C operator for each one, then combine them."
  - "An instruction between `multu` and its `mflo` is not part of the multiply. The scheduler moved it up to fill the wait for the result. Read around it."
---

# Two passes through HI/LO

When a product feeds into a remainder, the multiply unit and the divide unit
run one after the other: two sequences in one expression. Here is a simpler
unsigned example first, `(p * q) % 16` on `u32`s, where the remainder is cheap:

```asm
multu a0, a1        # HI:LO = p * q
mflo  v0            # the product
andi  t6, v0, 0xf   # % 16: power of two, so just a mask
or    v0, t6, zero  # copy into the return register
jr    ra
nop
```

A product, then a mask, and that is all. A remainder by a power of 2 never
uses the divider. (The final `or` with `zero` is the register copy you met in
the warmup. It moves the result into the return register.)

The divisor in the target below is *not* a power of two, so the second
sequence is a real hardware divide: the divisor goes in `at`, and the result
is fetched from HI. Two notes for reading it:

- **The scheduler mixes instructions together.** While the multiply is still
  working, IDO fills the wait with instructions that don't depend on it. So
  expect to find a useful instruction between `multu` and `mflo`. In the
  target, it is the `addiu` that loads the divisor. It belongs to the *next*
  operation, so don't let its position confuse your decoding.
- **One result, no checks.** The target fetches only one result from its
  division, so it uses the short form with the divisor in `at`. There are no
  `break` safety checks in the listing.

Decode each sequence, join them with the right operator, and check your types.
A `multu` is normal even for signed products, so it does not tell you the
types. The divide mnemonic does, so check whether it is `div` or the unsigned
form.

## Your task

Write `func_803c9c78` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803c9c78(s32 a, s32 b) {
    return a * b % 100;
}
```
