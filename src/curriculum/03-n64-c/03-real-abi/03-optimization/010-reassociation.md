---
id: 2b826f91-6008-497b-a213-4d513a7dbbb7
slug: opt-reassociation
title: Regrouped by the Compiler
difficulty: 3
concepts:
  - optimizer
  - reassociation
  - arithmetic
  - fingerprints
symbol: func_802e09bc
hints:
  - "There are three instructions and four arguments, and each argument is used once. List which operation uses which argument, and rebuild the expression from the leaves."
  - "More than one way of writing the C produces this exact chain. Write the one that reads naturally, and let the compiler regroup it."
---

# The compiler can change your grouping

Integer adds and subtracts are associative, and IDO knows this. If
*regrouping* your expression saves an instruction or gives a tighter schedule,
IDO will do it, and the grouping in the assembly will not match the grouping in
your source. Here is `regroup(a, b, c)`, whose source computes
`a * b + (c - a)`:

```asm
multu  a0, a1
mflo   t6
addu   t7, t6, a2   # (a×b) + c: not what the source grouped!
subu   v0, t7, a0   # … − a
jr     ra
nop
```

The source says "compute `c - a`, then add it to the product." The compiler
uses "add `c` to the product, then subtract `a`" instead, which gives the same
result. That version can start straight from the `mflo` result, so real work
fills the two-slot window instead of `nop`s. The math is the same. The *shape*
is the compiler's choice.

There are two lessons here:

- **Read expressions from the dataflow.** List the operations and the values
  each one uses. The order of the chain in the target was chosen by the
  optimizer. It does not show how the source grouped things.
- **Don't change your C to force a grouping.** Several ways of writing the same
  arithmetic compile to the same instructions here. Write the natural one. If
  the diff matches, it *was* the same expression.

The target combines its arguments using some subtractions and an addition,
regrouped into one flat chain. List the operations first, then write the C that
says it plainly.

## Your task

Write `func_802e09bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802e09bc(s32 a, s32 b, s32 c, s32 d) {
    return (a - b) + (c - d);
}
```
