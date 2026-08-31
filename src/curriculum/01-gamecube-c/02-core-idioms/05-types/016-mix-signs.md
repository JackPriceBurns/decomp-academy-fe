---
id: 1103f32c-95ce-5788-b013-24673be3f3ba
slug: types-mix-signs
title: Mixed Signedness in One Expression
difficulty: 3
concepts:
  - widening
  - zero-extension
  - sign-extension
  - mixed-signedness
  - operand-order
symbol: func_80040fcc
hints:
  - "One operand zero-extends (`clrlwi`), the other sign-extends (`extsb`/`extsh`)
    — the extend each operand gets is decided by *its own* declared signedness,
    not the other's."
  - "A subtraction of two values is `subf rD, rA, rB`, which computes `rB − rA`;
    watch which widened operand ends up subtracted from which."
---

# Signedness is decided per operand, not per expression

When an expression mixes signed and unsigned values, the compiler doesn't pick
one rule for the whole expression — it asks each operand how it wants to be
widened. Unsigned values get a `clrlwi` mask; signed values get their sign
copied up with `extsb` or `extsh`. Only after both are full width does the
arithmetic happen.

Take `merge(a, b)`, adding a signed `s16` to an unsigned `u8`:

```asm
extsh  r3, r3      # a: sign-extend (s16 is signed)
clrlwi r0, r4, 24  # b: zero-extend (u8 is unsigned)
add    r3, r3, r0
blr
```

`extsh` next to `clrlwi` tells you immediately: one signed operand, one
unsigned. Read each extend on its own — its kind gives you the signedness, and
its reach gives you the width, either the `clrlwi` shift count or the choice
between `extsb` and `extsh`.

Your target uses `subf` instead of `add`. Remember that `subf rD, rA, rB`
computes `rB − rA`, so the order of operands in C determines which widened
value is subtracted from which.

## Your task

Write `func_80040fcc` to match the target assembly. Both extends and the `subf`
must line up.

<!-- solution -->
```c
int func_80040fcc(u8 a, s8 b) {
    return a - b;
}
```
