---
id: cb9f43b8-53ee-483c-b89c-1a3814b24932
slug: arithmetic-variable-multiply
title: The Real Multiplier at Last
difficulty: 2
concepts:
  - arithmetic
  - multiply
  - hi-lo
symbol: func_802e7d0c
hints:
  - "`multu` + `mflo` is the whole product ritual — then look at what the fetched
    result flows into next."
  - "Don't count nops; the compiler places them. Write the expression and let it schedule."
---

# multu and the LO register

When both factors are runtime values, no shift chain can help — the compiler
finally uses the multiply unit. Like division, multiplication deposits its
result in the special **HI/LO** pair: the product of two 32-bit values is 64
bits wide, and LO holds the low half, HI the high. Here's `prod(x, y)`
returning `x * y`:

```asm
multu a0, a1       # HI:LO = x * y
mflo  v0           # fetch the low 32 bits
nop
nop
jr    ra
nop
```

`mflo` you know from division; the two `nop`s after it are the same story as
the divider — the multiply unit takes several cycles and IDO pads
conservatively. Your C never mentions them.

But wait — `multu` is the *unsigned* multiply, and these are `s32`s. Is that a
bug? No, and the reason is worth understanding once: a C multiply of two
32-bit values keeps only the low 32 bits of the product, and **the low 32 bits
of a signed and an unsigned multiply are identical**. Signedness only changes
the high half, which this expression throws away. Since either instruction
would be correct, IDO always picks `multu` — so expect `multu` for ordinary
`s32 * s32` and don't let the `u` fool you into rewriting your types.

In the target below, the product isn't the end of the story. Follow the
register that `mflo` writes and see where it goes.

## Your task

Write `func_802e7d0c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802e7d0c(s32 a, s32 b, s32 c) {
    return a * b + c;
}
```
