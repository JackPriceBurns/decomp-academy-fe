---
id: 5e0e2271-0185-4759-8ae7-c7bc3fb79951
slug: gba-numbers-float-compare
title: Comparing Floats
difficulty: 3
concepts:
  - floating-point
  - comparison
  - control-flow
symbol: func_0829a730
hints:
  - "`__gtsf2` returns a signed integer that is positive exactly when the
    comparison is true, and the `bgt` tests that integer. Read the pair as the
    single C operator `>`."
  - "Two `f32` in, an `f32` out. `r5` and `r4` hold the two arguments across
    the call, so the branch can pick one of them."
---

# A helper and a branch for each comparison

A float comparison cannot use `cmp`. Once signs are involved, the exponent and
mantissa fields do not sort correctly as plain integers. So comparisons need
helpers too. There are six of them, one for each C operator:

`__ltsf2` `__lesf2` `__gtsf2` `__gesf2` `__eqsf2` `__nesf2`

Each one returns a **signed integer**, and the sign of that integer gives the
answer. gcc then tests the integer with the ordinary integer branch of the same
name. This means a float comparison always appears as a pair:

```asm
0        push      {lr}
2        bl        __lesf2-4
6        cmp       r0, #0
8        ble       14 ~>
10       mov       r0, #9
12       b         16 ~>
14     ~>mov       r0, #7
16     ~>pop       {r1}
18       bx        r1
```

`__lesf2` is followed by `ble`, and `__gtsf2` by `bgt`. The helper names the
operator and the branch agrees with it. So you only need to read one of them,
and you can use the other as a check.

The exception is when the source negated the comparison. Then the two disagree
on purpose:

```asm
0        push      {lr}
2        bl        __ltsf2-4
6        cmp       r0, #0
8        bge       14 ~>
10       mov       r0, #9
12       b         16 ~>
14     ~>mov       r0, #7
16     ~>pop       {r1}
18       bx        r1
```

The function is the same byte for byte except for this pair: `__ltsf2` with
`bge` instead of `__lesf2` with `ble`. gcc does not convert these to one
standard form. The helper records the operator the programmer typed, and the
branch condition records whether it was wrapped in a `!`. So `!(a < b)` and
`a >= b` mean the same thing but compile to different symbols. A decompilation
that picks the wrong one will not match.

Operand order is kept in the same way. If you swap the operands and write
`b > a` instead of `a < b`, you pay for three `mov`s to swap the registers,
*and* you get a different helper.

Your target keeps two values alive across the call, which is why it pushes two
callee-saved registers. Read the branch to see which value is returned.

## Your task

Write `func_0829a730` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0829a730(f32 a, f32 b) {
    if (a > b) return a;
    return b;
}
```
