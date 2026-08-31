---
id: 0fe3f21d-1c6e-455b-a089-ac5f2c7bde6f
slug: arithmetic-unsigned-pow2-remainder
title: Remainder by Mask
difficulty: 1
concepts:
  - arithmetic
  - divide
  - bitwise
symbol: func_803f8fc8
hints:
  - "`andi` with a mask of all-ones bits computes a remainder; the divisor is
    the mask plus one."
  - "0x3f in binary is six one-bits — what power of two is one above it?"
---

# The remainder is the low bits

The companion trick: remainder by a power of two, on an unsigned value, is
just the bottom bits of the number. `x % 16` asks "what's left after removing
whole 16s?" — and since each 16 is one step of the upper bits, the answer is
literally the low four bits, untouched. One `andi` grabs them:

```asm
andi v0, a0, 0xf   # v0 = x & 15  =  x % 16
jr   ra
nop
```

`andi` keeps only the bits where the mask has ones — here the low four — and
zeroes the rest. The recipe for reading it as a remainder: **the divisor is
the mask plus one**. Mask 0xf is 15, so this is `% 16`; mask 0x1ff would be
`% 512`. (A mask of that all-ones form is the tell. `andi` with a scattered
mask like 0x2200 is genuine bit work, not arithmetic — that's the next
chapter's territory.)

As with the shift, `x % 16` and `x & 15` compile identically, and as with the
shift, this only works unsigned — a bare unguarded `andi` remainder tells you
the C type is unsigned. The signed version drags in a fix-up, coming up in a
couple of lessons.

## Your task

Write `func_803f8fc8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_803f8fc8(u32 a) {
    return a % 64;
}
```
