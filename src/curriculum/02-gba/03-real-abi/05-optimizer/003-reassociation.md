---
id: 70b020e5-4984-4ceb-b078-8ead5261e0cb
slug: gba-optimizer-reassociation
title: The Compiler Rearranges Sums
difficulty: 4
concepts:
  - optimizer
  - arithmetic
  - constants
symbol: func_083c1118
hints:
  - "`mov #128` followed by `lsl #3` builds one constant, 1024. The compiler
    made it by folding two constants that were written on two different
    terms."
  - The function takes three `s32` parameters and returns an `s32`. The third
    parameter is added and the second is subtracted. The first and the third
    each had a constant, and the two constants partly cancel, leaving a
    positive total.
---

# Where the constant ends up

A chain of additions reaches gcc as a tree. The first thing `fold` does is
gather every constant leaf into one constant. Three terms that each carry a
constant become three terms and a single immediate. Only after that does the
compiler decide which register the immediate is added to.

The immediate does not have to end up where you wrote it. The fold rebuilds
the sum in its own standard order before register allocation runs. So the
constant can end up added to a register that holds a different variable from
the one you wrote it next to. To find out which register it lands on, compile
your version and look.

The three versions below compute the same number but produce three different
functions. If you are matching a target and the `add #imm` is on the wrong
register, your arithmetic is right and your parentheses are wrong.

```asm
0        add       r1, #10
2        add       r0, r1
4        bx        lr
```

That is `(x + 10) + y`. The `+ 10` was written next to `x`, but the compiler
added it to `r1`, which holds `y`.

```asm
0        add       r0, #10
2        add       r0, r1
4        bx        lr
```

That is `x + (y + 10)`, the mirror image. Again the immediate moved to the
other variable.

```asm
0        add       r0, r1
2        add       r0, #10
4        bx        lr
```

That is `x + y + 10` with no parentheses. The variables are added first, and
then the constant is added to the result. All three listings compute the same
value.

The same fold runs when the constants have different signs. They are added
together as usual. If the total is too large for an 8-bit immediate, the
compiler builds it with `mov`/`lsl` before adding it. The fold only combines
constants that the expression brings together. A chain written flat can leave
them on separate terms, and then each one costs its own instructions.

Read the constant in your target and work out its value. Then work out where
the parentheses must go so that it lands on that register.

## Your task

Write `func_083c1118` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083c1118(s32 a, s32 b, s32 c) {
    return (a - 300) + (c + 1324) - b;
}
```
