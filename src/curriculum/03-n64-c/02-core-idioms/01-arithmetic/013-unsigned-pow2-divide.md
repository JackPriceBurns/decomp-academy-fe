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
  - "A single `srl` on an unsigned value is a division. The shift amount is the exponent."
  - "Read k, compute 2^k, and write a division by that constant."
---

# Division as a single shift

When the divisor is a power of two and the value is *unsigned*, division
becomes a single instruction. `srl` (**s**hift **r**ight **l**ogical) moves
bits to the right and fills the top with zeros. Each place it shifts halves
the value. Here's a `u32` divided by 16:

```asm
srl  v0, a0, 4     # v0 = x >> 4  =  x / 16
jr   ra
nop
```

There is no `divu`, no HI/LO and no nops. The whole division is one shift.
Just as `sll` by k multiplies by 2^k, `srl` by k divides by 2^k and throws
away the remainder. That is exactly what unsigned integer division does, so
the shift *is* the division. IDO will never use the slow divide unit for it.

When you decode one of these, you have a real choice in C: `x / 16` and
`x >> 4` compile to identical output. Either one matches. Pick the one the
original programmer would most likely have written: division for sizes and
counts, shifts for bit manipulation.

The word *unsigned* is important in this lesson. On a signed value, the same
shift rounds negative inputs the wrong way. The compiler knows this and adds a
guarded fix-up, which you will meet two lessons from now. So a single `srl`
with no branch is itself a type clue: the value is unsigned.

## Your task

Write `func_80207ba4` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80207ba4(u32 a) {
    return a / 8;
}
```
