---
id: 4e9f36c6-7c07-450b-b8d2-73d6ab10d1a4
slug: bitwise-clear-bits
title: "Clearing Bits: AND With a Negative"
difficulty: 2
concepts:
  - bitwise
  - masks
  - fingerprints
symbol: func_803a7cd8
hints:
  - "The `addiu`-from-`zero` constant is negative. Write it in hex (sign-extend it to 32 bits in your head) and you're looking at an inverted mask."
  - "`~m` is `-m - 1`. Add 1 to the magnitude of the negative constant and
    you have the mask being cleared — put that inside the `~`."
---

# Erasing bits instead of keeping them

Last lesson's masks said which bits to *keep*. Just as often, C wants to
*clear* a few bits and keep everything else: `x & ~mask`. The inverted mask is
almost all ones — including the upper 16 bits, which `andi`'s zero-extended
immediate can never reach. So `andi` is out.

Watch what the compiler does instead, clearing bits 4 and 5:

```asm
addiu at, zero, -49   # at = 0xffffffcf — all ones except bits 4-5
and   v0, a0, at      # clear those two bits, keep the rest
jr    ra
nop
```

The trick is that `addiu`'s immediate is **sign-extended**: a negative
constant fills the upper 16 bits with ones for free. One instruction builds a
mask that's mostly ones, and a register `and` applies it. That
`addiu`-negative-then-`and` pair is the standard smell of a bit-clear.

Decoding it is two small steps:

- **Recover the 32-bit constant.** -49 sign-extends to `0xffffffcf`.
- **Un-invert it.** `~m` is `-m - 1`, so a constant of -49 means the mask was
  48 — `0x30`, bits 4 and 5. The C is `x & ~0x30`.

Write the C with the `~` and the *positive* mask, the way a programmer
thinks — "clear these flags" — and let the compiler rediscover the negative
constant. The target below clears a different pair of bits; run the
arithmetic backwards to find which.

## Your task

Write `func_803a7cd8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a7cd8(s32 x) {
    return x & ~0xc0;
}
```
