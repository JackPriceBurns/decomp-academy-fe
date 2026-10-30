---
id: 2670e03a-c8de-46c1-aa27-1d409aed7094
slug: bitwise-and-mask
title: "andi: Keeping Only Some Bits"
difficulty: 1
concepts:
  - bitwise
  - immediates
symbol: func_8019c380
hints:
  - "The immediate on the `andi` is the mask. It marks the bits that are kept. Use the same constant in your C."
  - "Write the constant in hex, because it describes bit positions and is not used as a quantity."
---

# AND as a filter

In this chapter, the instructions treat a register as **32 individual
switches**, one for each bit. The value as a whole number does not matter. The
first instruction is AND. A bit of the result is 1 only where *both* inputs
have a 1. If one input is a constant, called a **mask**, AND works as a
filter. The ones in the mask mark the bits to keep, and the zeros clear the
other bits.

The immediate form of AND is `andi`. Here is a function that keeps bits 8
through 15 (the second byte) of its input:

```asm
andi v0, a0, 0xff00   # keep bits 8-15, clear everything else
jr   ra
nop
```

Every bit outside the mask's ones is now zero. Every bit inside them is
unchanged. In C this is `x & 0xff00`.

There are two things to know about `andi`:

- **The immediate is *zero*-extended.** `addiu` sign-extends its immediate,
  and `andi` does not. The 16-bit field fills the low half of the mask, so the
  upper 16 bits of the mask are always zero. A mask with bits in the top half
  of the register can't use `andi` at all. When you meet one, remember `lui`.
- In the last chapter you saw `andi` used for arithmetic, as `% 2^k`. There
  its mask was a solid run of ones ending at bit 0. A mask with a different
  shape, like 0xff00 with its ones in the middle, is real bit work. For that
  mask the C should use `&` instead of `%`.

Read the mask in the target. Write it in hex in your C, because a mask
describes bit positions.

## Your task

Write `func_8019c380` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8019c380(s32 a) {
    return a & 0xf0;
}
```
