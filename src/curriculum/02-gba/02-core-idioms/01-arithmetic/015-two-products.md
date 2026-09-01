---
id: 76f022c6-ef83-4c00-b370-8360f2e9317b
slug: gba-arithmetic-two-products
title: Two Products, One Difference
difficulty: 4
concepts:
  - multiply
  - registers
  - operand-order
symbol: func_08073a5c
hints:
  - Two products are built independently and then combined. Read which two
    registers each `mul` consumes before you worry about the subtraction.
  - "Four `s32` parameters in, an `s32` out. One product pairs the first with the
    fourth, the other pairs the second with the third, and the second product is
    subtracted from the first."
---

# Two multiplies, and the copy that appears between them

Two products in one expression are computed in source order, each in its own
register, and then combined. What varies — and it varies more than you would
expect — is whether an extra `mov` shows up between them.

Here is `w * y + x * z`, pairing the first argument with the third and the second
with the fourth:

```asm
0        mul       r0, r2
2        mul       r1, r3
4        add       r0, r1
6        bx        lr
```

Three instructions, no waste. Each product overwrites a register it was already
using, and the two land conveniently in `r0` and `r1`.

Now `w * x - y * z`, which pairs adjacent arguments instead:

```asm
0        mul       r0, r1
2        mov       r1, r2
4        mul       r1, r3
6        sub       r0, r1
8        bx        lr
```

Four instructions for the same amount of arithmetic. The first product consumed
`r0` and `r1`; the second could have been computed as `mul r2, r3` and subtracted
straight from `r0`, but gcc copies `y` down into the register the first product
just freed and works there instead.

There is no deep reason for that copy — it is a register-allocation habit of this
compiler, and knowing it exists is more useful than explaining it. What matters
for matching is that **you cannot choose it**. The shape of the listing is
decided by which arguments you pair up in the C, so if your target has the extra
`mov` and your attempt does not, the fix is in the operand pairing, not in
rewriting the arithmetic.

Read the two `mul` instructions in your target, note which registers they
consume, and then read the direction of the final subtract.

## Your task

Write `func_08073a5c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08073a5c(s32 a, s32 b, s32 c, s32 d) {
    return d * a - b * c;
}
```
