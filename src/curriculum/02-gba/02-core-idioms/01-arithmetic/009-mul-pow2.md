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
  - Each `lsl` is a multiply by 2 to the power of its shift amount. Work out both
    factors before you look at how they are combined.
  - "Three `s32` parameters in, an `s32` out, with the first unused. One product
    scales by 16 and the other by 8."
---

# Powers of two never reach the multiplier

`mul` is the only multiply instruction Thumb has, and gcc avoids it whenever the
constant is a power of two. A shift does the same job in one instruction, with
none of `mul`'s register constraints and none of its extra cycles.

Here is `y * 32`:

```asm
0        lsl       r0, r1, #5
2        bx        lr
```

The factor is hiding in the shift amount: 2 to the power 5 is 32. Reading it
back is always that, and the shift form has a three-operand encoding, so the
value can be read from one register and written to another without any
preparatory copy.

The interesting part is what happens around the shift. Here is `y - x * 4`:

```asm
0        lsl       r0, #2
2        sub       r0, r1, r0
4        bx        lr
```

The product is built in `r0` — two-operand this time, because `x` was already
there and is not needed afterwards — and then the reverse-subtract form takes it
away from `y`. That `sub rD, rN, rD` shape is the direction marker from earlier
in the chapter, and it survives having a product on one side.

A listing with several shifts in a row is usually several scaled values waiting
to be combined, one shift each. Take each `lsl` on its own, convert it to its
factor, then read the instruction that joins them. Whether a given shift
comes out two-operand or three-operand depends only on whether the value being
scaled is still needed afterwards.

Your target scales two different values before combining them.

## Your task

Write `func_08057d4c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08057d4c(s32 a, s32 b, s32 c) {
    return c * 16 - b * 8;
}
```
