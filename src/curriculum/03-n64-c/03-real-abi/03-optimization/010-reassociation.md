---
id: 2b826f91-6008-497b-a213-4d513a7dbbb7
slug: opt-reassociation
title: Regrouped Behind Your Back
difficulty: 3
concepts:
  - optimizer
  - reassociation
  - arithmetic
  - fingerprints
symbol: func_802e09bc
hints:
  - "Three instructions, four arguments, each used once. List which operation touches which argument and rebuild the expression from the leaves."
  - "More than one C spelling produces this exact chain — write the one that reads naturally and trust the compiler to regroup."
---

# Your parentheses are a suggestion

Integer adds and subtracts are associative, and IDO knows it. When it can
save an instruction or tighten the schedule by *regrouping* your expression,
it will — and the assembly's grouping won't match your source's. Here's
`regroup(a, b, c)`, whose source computes `a * b + (c - a)`:

```asm
multu  a0, a1
mflo   t6
addu   t7, t6, a2   # (a×b) + c   — not what the source grouped!
subu   v0, t7, a0   # … − a
jr     ra
nop
```

The source says "compute `c - a`, add it to the product." The compiler
answered: same result as "add `c` to the product, then subtract `a`" — and
that version chains straight off `mflo`, filling the two-slot window with real
work instead of `nop`s. The math is identical; the *shape* is the compiler's.

Two lessons inside this one:

- **Read expressions from the dataflow, not the visual grouping.** Inventory
  the operations and which value each consumes; the target's chain order is
  the optimizer's choice, not a transcript of the source.
- **Don't contort your C to force a grouping.** Several spellings of the same
  arithmetic compile to the same instructions here. Write the natural one; if
  the diff matches, it *was* the same expression.

The target combines its arguments with a mix of subtractions and an addition,
regrouped into one flat chain. Inventory first, then write the C that says it
plainly.

## Your task

Write `func_802e09bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802e09bc(s32 a, s32 b, s32 c, s32 d) {
    return (a - b) + (c - d);
}
```
