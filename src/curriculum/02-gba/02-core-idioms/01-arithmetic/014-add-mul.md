---
id: ae9f4941-fd86-4bf1-af90-3b5ad4c8ffcf
slug: gba-arithmetic-add-mul
title: Parentheses You Can See
difficulty: 3
concepts:
  - multiply
  - expressions
  - operand-order
symbol: func_0806ec18
hints:
  - Any arithmetic that happens before the `mul` is a subexpression in
    brackets. The multiply cannot start until its operands have been computed.
  - The function takes four `s32` parameters and returns an `s32`. The first
    two are added together, the last two are added together, and then the two
    sums are multiplied.
---

# The sum in brackets comes before the multiply

An addition inside a multiply cannot be removed or reordered. So it appears in
the listing as a separate instruction that runs first. That makes brackets
around a sum one of the clearest things to read in this chapter.

Here is `(x + y) * z`:

```asm
0        add       r0, r1
2        mul       r0, r2
4        bx        lr
```

The sum is built in `r0`, and then multiplied by `z`. Here is `x * (y + z)`,
with the bracket on the other side:

```asm
0        add       r1, r2
2        mul       r0, r1
4        bx        lr
```

This time the sum goes to `r1`. `x` is still needed as the other factor, and it
is already in the destination.

The `mul` itself does not show which factor was written first, because a
single multiply has no way to encode that. The `add` before it does show it.
**The register written by the earlier instruction held a bracket**, and the
register that was left alone held the value outside it.

Also notice what gcc did *not* do here. It never multiplies out the brackets.
`(x + y) * z` could become `x * z + y * z`, and a compiler that did that would
leave you with two multiplies to explain. agbcc groups the expression exactly
as the source wrote it, so a bracket in the listing is a bracket in the source.

When both factors are in brackets, both sums appear before the multiply, in
source order.

## Your task

Write `func_0806ec18` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0806ec18(s32 a, s32 b, s32 c, s32 d) {
    return (a + b) * (c + d);
}
```
