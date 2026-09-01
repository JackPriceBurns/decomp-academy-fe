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
  - "`neg rD, rM` lands at the exact point the source wrote the minus sign, so
    everything computed before it is the thing being negated."
  - "Two `s32` parameters in, an `s32` out. The first is scaled by 5, that whole
    product is negated, and the second parameter is then subtracted from it."
---

# A minus sign that survives as an instruction

Subtracting two values in a row and subtracting their sum reach the same answer
through different instructions.

`x - y - z`:

```asm
0        sub       r0, r1
2        sub       r0, r2
4        bx        lr
```

`x - (y + z)`:

```asm
0        add       r1, r2
2        sub       r0, r1
4        bx        lr
```

Two subtracts against the accumulator, or one addition off to the side and a
single subtract. The bracket is right there in the listing, exactly as it was in
the earlier addition chains — agbcc will not turn one of these into the other.

Explicit negation behaves the same way. gcc has a dedicated `neg rD, rM`, and it
appears where the source wrote the minus, rather than being folded into whatever
comes next. Here is `-(x + y) * 4`:

```asm
0        add       r0, r1
2        neg       r0, r0
4        lsl       r0, #2
6        bx        lr
```

Sum, negate, scale — in that order. Scaling first and negating afterwards would
give the same number and a different function.

A `neg` in the middle of a listing is therefore a boundary marker: everything
before it built the value that the minus sign applied to, and everything after it
operates on the negated result. That is all it takes to place the parentheses.

Not every minus sign gets one, though. You saw in the shift-and-subtract lesson
that a negative multiplier can be absorbed by swapping the operands of a `sub`,
and when that happens no `neg` is emitted at all. A `neg` that *does* survive is
telling you the negation could not be folded into the arithmetic around it.

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
