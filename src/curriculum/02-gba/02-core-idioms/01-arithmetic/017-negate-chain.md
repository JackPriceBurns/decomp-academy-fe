---
id: 1fe047e9-f787-4858-b55d-311791be30f9
slug: gba-arithmetic-negate-chain
title: Negation Inside an Expression
difficulty: 4
concepts:
  - arithmetic
  - strength-reduction
  - expressions
symbol: func_0807cb74
hints:
  - "`neg rD, rM` appears at the exact point where the source wrote the minus
    sign. So everything computed before it is the value being negated."
  - The function takes two `s32` parameters and returns an `s32`. The first is
    multiplied by 5, the whole product is negated, and then the second
    parameter is subtracted from it.
---

# A minus sign that stays as an instruction

Subtracting two values one after the other and subtracting their sum give the
same answer. They compile to different instructions.

Here is `x - y - z`:

```asm
0        sub       r0, r1
2        sub       r0, r2
4        bx        lr
```

And here is `x - (y + z)`:

```asm
0        add       r1, r2
2        sub       r0, r1
4        bx        lr
```

The first uses two subtracts on the running total. The second uses one addition
in another register, then a single subtract. The bracket is visible in the
listing, as it was in the earlier addition chains. agbcc will not turn one of
these into the other.

An explicit negation behaves the same way. gcc has a separate instruction for
it, `neg rD, rM`. It appears at the point where the source wrote the minus
sign, and gcc does not merge it into the instruction that comes next. Here is
`-(x + y) * 4`:

```asm
0        add       r0, r1
2        neg       r0, r0
4        lsl       r0, #2
6        bx        lr
```

The listing adds, then negates, then scales, in that order. If the source
scaled first and negated afterwards, the result would be the same number, but
the function would be different.

So a `neg` in the middle of a listing marks a boundary. Everything before it
built the value that the minus sign applied to. Everything after it works on
the negated result. That is all you need to place the parentheses.

Not every minus sign produces a `neg`. In the lesson on a shift followed by a
subtract, you saw that gcc can handle a negative multiplier by swapping the
operands of a `sub`. When that happens, there is no `neg` at all. A `neg` that
*does* appear tells you the negation could not be merged into the arithmetic
around it.

Your target has a chain, a `neg`, and a subtraction, in that order. Read them in
that order too.

## Your task

Write `func_0807cb74` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0807cb74(s32 a, s32 b) {
    return -(a * 5) - b;
}
```
