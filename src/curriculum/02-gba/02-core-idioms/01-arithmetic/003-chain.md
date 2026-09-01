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
    values it combines, then treat that result as a single quantity when you
    read the second line.
  - "Three `s32` parameters in, an `s32` out. The last instruction subtracts the
    value `r0` is holding from the third parameter, so `r0` was a bracketed
    subexpression."
---

# Where the brackets went

Three values and two instructions leaves gcc a choice: which pair does it
combine first? It never guesses, and it never rearranges your arithmetic to suit
itself. The order in the listing is the order in the source.

Here is a left-to-right sum, `(x + y) + z`:

```asm
0        add       r0, r1
2        add       r0, r2
4        bx        lr
```

The accumulator is `r0` from the first instruction onwards. Each `add` folds one
more value into the running total.

Now the same three values bracketed the other way, `x + (y + z)`:

```asm
0        add       r1, r2
2        add       r0, r1
4        bx        lr
```

`r1` is written first, holding `y + z`, and only then does `x` join in. Same
answer, different instructions, because agbcc will not reassociate an expression
even when the arithmetic would allow it. **The register written first holds the
innermost subexpression** — which means you can recover the brackets from the
listing every time.

That is worth noticing, because it is unusual. A modern compiler would
canonicalise both of these into one shape and the association would be gone by
the time you saw the object file. Here it survives.

Combine that with the direction rule from the last lesson and a two-instruction
listing can pin down a three-value expression exactly: the first line tells you
which pair was bracketed, and the operand positions in the second tell you which
way round the remaining subtraction runs.

Your target is two instructions, and the second one names `r0` twice.

## Your task

Write `func_0803c6d8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0803c6d8(s32 a, s32 b, s32 c) {
    return c - (a - b);
}
```
