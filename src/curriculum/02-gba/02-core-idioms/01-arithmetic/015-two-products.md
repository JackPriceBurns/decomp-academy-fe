---
id: 76f022c6-ef83-4c00-b370-8360f2e9317b
slug: gba-arithmetic-two-products
title: Subtracting Two Products
difficulty: 4
concepts:
  - multiply
  - registers
  - operand-order
symbol: func_08073a5c
hints:
  - Two products are built separately and then combined. Check which two
    registers each `mul` uses before you think about the subtraction.
  - The function takes four `s32` parameters and returns an `s32`. One product
    multiplies the first parameter by the fourth, and the other multiplies the
    second by the third. The second product is subtracted from the first.
---

# Two multiplies and the copy between them

When an expression has two products, gcc computes them in source order, each in
its own register, and then combines them. What changes from one expression to
another is whether an extra `mov` appears between them, and it changes more
often than you might expect.

Here is `w * y + x * z`. It pairs the first argument with the third, and the
second with the fourth:

```asm
0        mul       r0, r2
2        mul       r1, r3
4        add       r0, r1
6        bx        lr
```

That is three instructions with nothing extra. Each product overwrites a
register it was already using, and the two results end up in `r0` and `r1`,
ready for the `add`.

Now here is `w * x - y * z`, which pairs arguments that are next to each other:

```asm
0        mul       r0, r1
2        mov       r1, r2
4        mul       r1, r3
6        sub       r0, r1
8        bx        lr
```

That is four instructions for the same amount of arithmetic. The first product
used `r0` and `r1`. The second could have been computed as `mul r2, r3` and
subtracted straight from `r0`. Instead, gcc copies `y` into `r1`, the register
the first product just freed, and computes the second product there.

There is no deep reason for that copy. It is a habit of this compiler's
register allocator, and it is more useful to know that it happens than to
explain why. For matching, the important point is that **you cannot choose
it**. Which arguments you pair up in the C decides the shape of the listing. So
if your target has the extra `mov` and your attempt does not, fix the operand
pairing instead of rewriting the arithmetic.

Read the two `mul` instructions in your target and note which registers they
use. Then read the direction of the final subtract.

## Your task

Write `func_08073a5c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08073a5c(s32 a, s32 b, s32 c, s32 d) {
    return d * a - b * c;
}
```
