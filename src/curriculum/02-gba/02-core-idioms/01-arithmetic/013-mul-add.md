---
id: 43617c42-6808-4f58-a528-0ae0621500bf
slug: gba-arithmetic-mul-add
title: Product Then Sum
difficulty: 3
concepts:
  - multiply
  - arithmetic
  - registers
symbol: func_0806a380
hints:
  - The `mov` at the start sets up the destination for the multiply, because
    `mul` cannot write anywhere else. Neither factor was in the return register
    at the start.
  - The function takes four `s32` parameters and returns an `s32`. The first
    parameter is unused. The second and third are multiplied, and then the
    fourth is added.
---

# Where the product goes

A multiply followed by an addition is the most common arithmetic shape in game
code. Typical examples are an index times a size, or a velocity times a delta,
with an offset added. On this instruction set you can read it step by step,
once you know where `mul` has to put its result.

Here is `x * y + z`:

```asm
0        mul       r0, r1
2        add       r0, r2
4        bx        lr
```

The product overwrites `r0`, and then the third value is added to it. Addition
is commutative, and a single `mul` cannot record operand order. So several
different ways of writing that expression produce this exact listing. Writing
the sum the other way round changes nothing.

Subtraction tells you more. Here is `x * y - z`:

```asm
0        mul       r0, r1
2        sub       r0, r2
4        bx        lr
```

And here is `z - x * y`:

```asm
0        mul       r0, r1
2        sub       r0, r2, r0
4        bx        lr
```

The product and the instructions are the same. The only difference is the
register fields. The three-operand form takes the product **away from** `z`,
and the two-operand form takes `z` away from the product. The direction rule
from the start of the chapter still applies when one of the operands is a
product.

In all three examples, one factor was already in `r0`. When neither factor is
there, the multiply cannot start until a factor is copied into the destination.
So the function starts with a plain `mov r0, rN`. This is the same copy you saw
when the leftmost factor of a chain was in the wrong register, and it has the
same cause: `mul` writes only to the register that holds its left operand.

Read the `mov` in your target as setup. Work out which two registers the
product uses, and then see what happens to the product afterwards.

## Your task

Write `func_0806a380` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0806a380(s32 a, s32 b, s32 c, s32 d) {
    return b * c + d;
}
```
