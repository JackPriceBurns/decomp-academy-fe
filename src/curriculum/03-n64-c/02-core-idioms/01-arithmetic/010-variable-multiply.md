---
id: cb9f43b8-53ee-483c-b89c-1a3814b24932
slug: arithmetic-variable-multiply
title: The Real Multiply Instruction
difficulty: 2
concepts:
  - arithmetic
  - multiply
  - hi-lo
symbol: func_802e7d0c
hints:
  - "`multu` followed by `mflo` is the whole multiply sequence. Then look at where the fetched result goes next."
  - "Don't count the nops. The compiler places them, so write the expression and let it schedule the instructions."
---

# multu and the LO register

When both factors are runtime values, a shift chain cannot help, so the
compiler uses the multiply unit. Like division, multiplication puts its result
in the special **HI/LO** register pair. The product of two 32-bit values is 64
bits wide: LO holds the low half and HI holds the high half. Here's
`prod(x, y)` returning `x * y`:

```asm
multu a0, a1       # HI:LO = x * y
mflo  v0           # fetch the low 32 bits
nop
nop
jr    ra
nop
```

You know `mflo` from division. The two `nop`s after it are there for the same
reason as with the divider: the multiply unit takes several cycles, and IDO
adds padding to be safe. Your C never mentions them.

Note that `multu` is the *unsigned* multiply, even though these values are
`s32`s. This is not a bug. A C multiply of two 32-bit values keeps only the
low 32 bits of the product, and **the low 32 bits of a signed and an unsigned
multiply are identical**. Signedness only changes the high half, which this
expression throws away. Either instruction would be correct, and IDO always
picks `multu`. So expect `multu` for ordinary `s32 * s32`, and don't change
your types because of the `u`.

In the target below, the product is not the final result. Follow the register
that `mflo` writes and see where it goes.

## Your task

Write `func_802e7d0c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802e7d0c(s32 a, s32 b, s32 c) {
    return a * b + c;
}
```
