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
  - Any arithmetic that happens before the `mul` is a bracketed subexpression -
    the multiply cannot start until its operands exist.
  - "Four `s32` parameters in, an `s32` out. The first two are summed, the last
    two are summed, and the two sums are multiplied together."
---

# The bracket has to exist before the multiply can run

An addition inside a multiply cannot be folded away or reordered, so it shows up
in the listing as a separate instruction that runs first. That makes brackets
around a sum the easiest thing in this chapter to read.

Here is `(x + y) * z`:

```asm
0        add       r0, r1
2        mul       r0, r2
4        bx        lr
```

The sum is built in `r0`, then multiplied by `z`. And here is `x * (y + z)`,
where the bracket is on the other side:

```asm
0        add       r1, r2
2        mul       r0, r1
4        bx        lr
```

This time the sum goes to `r1`, because `x` is still needed as the other factor
and it is already sitting in the destination.

The `mul` itself gives away nothing about which factor was written first — a
single multiply has no way to encode that — but the `add` before it does. **The
register written by the earlier instruction held a bracket**, and the register
that was left alone held the value that was outside it.

It is worth appreciating what gcc did *not* do here. It never multiplies out.
`(x + y) * z` could become `x * z + y * z`, and a compiler that tried would leave
you two multiplies to explain. agbcc associates the expression exactly as the
source wrote it, so a bracket in the listing is a bracket in the source.

When both factors are bracketed, both sums appear before the multiply, in source
order.

## Your task

Write `func_0806ec18` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0806ec18(s32 a, s32 b, s32 c, s32 d) {
    return (a + b) * (c + d);
}
```
