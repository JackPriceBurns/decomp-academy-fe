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
  - The opening `mov` is setting up a destination for a multiply that has nowhere
    else to write. Neither factor was in the return register to begin with.
  - "Four `s32` parameters in, an `s32` out, with the first unused. The second
    and third are multiplied and the fourth is added on."
---

# Where the product lands

A multiply followed by an addition is the most common arithmetic shape in game
code — an index times a size, a velocity times a delta, plus an offset. On this
instruction set the reading is mechanical once you know where `mul` is forced to
put its answer.

Here is `x * y + z`:

```asm
0        mul       r0, r1
2        add       r0, r2
4        bx        lr
```

The product overwrites `r0`, and the third value folds in on top. Because
addition is commutative and a single `mul` cannot record operand order, several
different spellings of that expression produce this exact listing — writing the
sum the other way round changes nothing.

Subtraction is where it gets informative. `x * y - z`:

```asm
0        mul       r0, r1
2        sub       r0, r2
4        bx        lr
```

and `z - x * y`:

```asm
0        mul       r0, r1
2        sub       r0, r2, r0
4        bx        lr
```

Same product, same two instructions, and the only difference is the register
field: the three-operand form takes the product **away from** `z`, the
two-operand form takes `z` away from the product. The direction rule from the
start of the chapter applies unchanged when one of the operands is a product.

All three of those had a factor already sitting in `r0`. When neither factor
does, the multiply cannot begin until the destination is loaded, so the function
opens with a plain `mov r0, rN` — the same forced copy you met when the leftmost
factor of a chain was in the wrong place, for the same reason: `mul` writes only
to the register holding its left operand.

Read your target's `mov` as setup, work out which two registers the product
consumes, and see what happens to it afterwards.

## Your task

Write `func_0806a380` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0806a380(s32 a, s32 b, s32 c, s32 d) {
    return b * c + d;
}
```
