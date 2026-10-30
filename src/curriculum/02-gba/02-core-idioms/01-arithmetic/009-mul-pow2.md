---
id: 0b498b26-65d0-448d-a295-9e2b411fcf8d
slug: gba-arithmetic-mul-pow2
title: A Multiply That Became a Shift
difficulty: 3
concepts:
  - multiply
  - shifts
  - strength-reduction
symbol: func_08057d4c
hints:
  - Each `lsl` is a multiply by 2 to the power of its shift amount. Work out
    both factors before you look at how they are combined.
  - The function takes three `s32` parameters and returns an `s32`. The first
    parameter is unused. One product multiplies by 16 and the other by 8.
---

# A power of two becomes a shift

`mul` is the only multiply instruction Thumb has, and gcc avoids it whenever the
constant is a power of two. A shift does the same job in one instruction. It
has none of the register limits of `mul`, and it does not take extra cycles.

Here is `y * 32`:

```asm
0        lsl       r0, r1, #5
2        bx        lr
```

The factor is in the shift amount: 2 to the power 5 is 32. You always read it
back this way. The shift has a three-operand encoding, so it can read the value
from one register and write it to another without a copy first.

Now look at what happens around the shift. Here is `y - x * 4`:

```asm
0        lsl       r0, #2
2        sub       r0, r1, r0
4        bx        lr
```

The product is built in `r0`. This time the shift uses the two-operand form,
because `x` was already in `r0` and is not needed afterwards. Then the
reverse-subtract form takes the product away from `y`. That `sub rD, rN, rD`
shape is the direction marker from earlier in the chapter, and it still works
when one side is a product.

Several shifts in a row usually means several scaled values, one shift each,
that will be combined later. Take each `lsl` on its own and convert it to its
factor. Then read the instruction that combines them. Whether a shift uses the
two-operand or the three-operand form depends only on whether the value being
scaled is needed afterwards.

Your target scales two different values before combining them.

## Your task

Write `func_08057d4c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08057d4c(s32 a, s32 b, s32 c) {
    return c * 16 - b * 8;
}
```
