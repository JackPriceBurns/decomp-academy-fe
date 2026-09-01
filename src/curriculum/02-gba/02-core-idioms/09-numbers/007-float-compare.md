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
    comparison held, and the `bgt` tests that integer. Read the pair as the
    single C operator `>`."
  - "Two `f32` in, an `f32` out. `r5` and `r4` hold the two arguments across
    the call so the branch can pick one of them."
---

# Two compares for one comparison

A float comparison cannot use `cmp` — the exponent and mantissa fields do not
order correctly as plain integers once signs are involved. So comparison gets
helpers too, six of them, one per C operator:

`__ltsf2` `__lesf2` `__gtsf2` `__gesf2` `__eqsf2` `__nesf2`

Each returns a **signed integer** whose sign encodes the answer, and gcc then
tests that integer with the ordinary integer branch of the same name. Which
means a float comparison always appears as a pair:

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

`__lesf2` then `ble`. `__gtsf2` then `bgt`. The helper names the operator and
the branch confirms it, so you only have to read one of them and can use the
other as a check.

Except when the source negated the comparison, and then the two disagree on
purpose:

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

Byte for byte the same function apart from the symbol — `__ltsf2` with `bge`
rather than `__lesf2` with `ble`. gcc never canonicalises here: the helper
records the operator the programmer typed and the branch condition records
whether it was wrapped in a `!`. So `!(a < b)` and `a >= b`, which mean the
same thing, compile to different symbols, and a decompilation that picks the
wrong one will not match.

The same non-canonicalisation catches operand order. Swap the operands and
write `b > a` instead of `a < b` and you pay three `mov`s to swap the registers
*and* get a different helper.

Your target keeps two values alive across the call, which is why it pushes two
callee-saved registers. Read the branch to see which of them comes back.

## Your task

Write `func_0829a730` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0829a730(f32 a, f32 b) {
    if (a > b) return a;
    return b;
}
```
