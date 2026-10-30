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
  - "The constant that `addiu` builds from `zero` is negative. Write it in hex, sign-extended to 32 bits, and you will see an inverted mask."
  - "`~m` is `-m - 1`. Add 1 to the negative constant and drop the minus sign.
    That gives you the mask being cleared. Put that mask inside the `~`."
---

# Erasing bits instead of keeping them

The `andi` masks earlier in this chapter said which bits to *keep*. Just as
often, C code needs to *clear* a few bits and keep all the others:
`x & ~mask`. The inverted mask is almost all ones, including the upper 16
bits. The zero-extended immediate of `andi` can never set those bits, so
`andi` can't be used.

Here is what the compiler does instead, clearing bits 4 and 5:

```asm
addiu at, zero, -49   # at = 0xffffffcf: all ones except bits 4-5
and   v0, a0, at      # clear those two bits, keep the rest
jr    ra
nop
```

This works because the immediate of `addiu` is **sign-extended**. A negative
constant fills the upper 16 bits with ones at no extra cost. One instruction
builds a mask that is mostly ones, and a register `and` applies it. A negative
`addiu` followed by an `and` is the standard sign of a bit-clear.

Decoding it takes two small steps:

- **Recover the 32-bit constant.** -49 sign-extends to `0xffffffcf`.
- **Undo the inversion.** `~m` is `-m - 1`, so a constant of -49 means the
  mask was 48, which is `0x30` (bits 4 and 5). The C is `x & ~0x30`.

Write the C with the `~` and the *positive* mask. That is how a programmer
thinks about it ("clear these flags"), and the compiler will produce the
negative constant itself. The target below clears a different pair of bits.
Work the arithmetic backwards to find which ones.

## Your task

Write `func_803a7cd8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a7cd8(s32 x) {
    return x & ~0xc0;
}
```
