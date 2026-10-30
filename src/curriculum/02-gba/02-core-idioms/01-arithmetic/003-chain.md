---
id: dc505f7a-8889-42e9-b45f-7f5bd3b76862
slug: gba-arithmetic-chain
title: Three Operands, Two Instructions
difficulty: 3
concepts:
  - arithmetic
  - operand-order
  - expressions
symbol: func_0803c6d8
hints:
  - The first instruction does not produce the return value. Work out which two
    values it combines, then treat that result as a single value when you read
    the second line.
  - The function takes three `s32` parameters and returns an `s32`. The last
    instruction subtracts the value in `r0` from the third parameter, so `r0`
    held a subexpression in brackets.
---

# Finding the brackets

With three values and two instructions, gcc has to decide which pair to combine
first. It always follows the source and never rearranges your arithmetic to
suit itself. The order in the listing is the order in the source.

Here is a left-to-right sum, `(x + y) + z`:

```asm
0        add       r0, r1
2        add       r0, r2
4        bx        lr
```

From the first instruction onwards, `r0` holds the running total. Each `add`
adds one more value to it.

Now the same three values with the brackets the other way, `x + (y + z)`:

```asm
0        add       r1, r2
2        add       r0, r1
4        bx        lr
```

`r1` is written first and holds `y + z`. Only after that is `x` added. The
answer is the same but the instructions are different, because agbcc does not
regroup (reassociate) an expression, even when the arithmetic would allow it.
**The register written first holds the innermost subexpression.** This means
you can recover the brackets from the listing every time.

This is unusual. A modern compiler would rewrite both of these into one
standard form, so by the time you saw the object file, the grouping would be
lost. With agbcc, the grouping is still in the listing.

Add the direction rule from the last lesson, and a listing of two instructions
gives you a three-value expression exactly. The first line tells you which pair
was in brackets. The operand positions in the second line tell you which way
round the remaining subtraction goes.

Your target has two instructions, and the second one names `r0` twice.

## Your task

Write `func_0803c6d8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0803c6d8(s32 a, s32 b, s32 c) {
    return c - (a - b);
}
```
