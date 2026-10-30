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
  - "`andi` with a mask whose bits are all ones computes a remainder. The divisor is the mask plus one."
  - "0x3f in binary is six one-bits. What power of two is one above it?"
---

# The remainder is the low bits

There is a matching shortcut for remainders. On an unsigned value, the
remainder by a power of two is the bottom bits of the number. `x % 16` asks
"what is left after removing whole 16s?" Each 16 is one step in the upper
bits, so the answer is the low four bits, unchanged. One `andi` keeps them:

```asm
andi v0, a0, 0xf   # v0 = x & 15  =  x % 16
jr   ra
nop
```

`andi` keeps only the bits where the mask has ones (here, the low four) and
sets the rest to zero. To read it as a remainder, use this rule: **the divisor
is the mask plus one**. Mask 0xf is 15, so this is `% 16`. Mask 0x1ff would be
`% 512`. (A mask made of all ones in the low bits is the sign to look for.
`andi` with a scattered mask like 0x2200 is real bit manipulation, not
arithmetic. The next chapter covers that.)

As with the shift, `x % 16` and `x & 15` compile identically. Also as with the
shift, this only works for unsigned values, so an `andi` remainder with no
guard tells you the C type is unsigned. The signed version needs a fix-up,
which comes in a couple of lessons.

## Your task

Write `func_803f8fc8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_803f8fc8(u32 a) {
    return a % 64;
}
```
