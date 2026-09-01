---
id: 70b020e5-4984-4ceb-b078-8ead5261e0cb
slug: gba-optimizer-reassociation
title: Sums Rearranged
difficulty: 4
concepts:
  - optimizer
  - arithmetic
  - constants
symbol: func_083c1118
hints:
  - "`mov #128` then `lsl #3` is one constant: 1024. It arrived by folding two
    constants that were written on two different terms."
  - Three `s32` parameters, an `s32` out. The third one is added, the second
    subtracted, and both the first and third carried a constant that cancelled
    down to a net gain.
---

# Where the constant lands

An addition chain reaches gcc as a tree, and the first thing `fold` does is
gather every constant leaf into one. Three terms with a constant each become
three terms and a single immediate, and only then does the compiler decide
which register that immediate is added to.

Where the immediate lands is not where you wrote it. The fold rebuilds the sum
in its own canonical order before register allocation runs, so the constant can
finish up on a register holding a variable it was never written beside. The way
to find out which register is to compile the spelling and look.

All three spellings below compute the same number and produce three different
functions. If you are matching a target and the `add #imm` sits on the wrong
register, the arithmetic is right and the parentheses are wrong.

```asm
0        add       r1, #10
2        add       r0, r1
4        bx        lr
```

That is `(x + 10) + y`. The `+ 10` was written on `x`, and the compiler put it
on `r1`, which holds `y`.

```asm
0        add       r0, #10
2        add       r0, r1
4        bx        lr
```

That is `x + (y + 10)` — the mirror image, and again the immediate crossed to
the other side.

```asm
0        add       r0, r1
2        add       r0, #10
4        bx        lr
```

And that is `x + y + 10` with no parentheses at all: the variables are summed
first and the constant is applied to the result. Three listings, one value.

The same fold runs when the constants disagree in sign — they simply add up,
and a total too large for an 8-bit immediate gets built with `mov`/`lsl` before
it can be applied. The fold only reaches constants the expression brings
together, though: a chain written flat can leave them on separate terms, and
then you pay for each one on its own.

Read your target's constant, work out what it is, then work out where the
parentheses have to sit for it to land on that register.

## Your task

Write `func_083c1118` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083c1118(s32 a, s32 b, s32 c) {
    return (a - 300) + (c + 1324) - b;
}
```
