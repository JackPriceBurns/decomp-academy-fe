---
id: 80aeb42a-cca3-4084-9de7-cd47b0171787
slug: gba-control-bool
title: A Comparison as a Value
difficulty: 2
concepts:
  - branches
  - comparisons
  - control-flow
symbol: func_08139a64
hints:
  - The seed is 0 and the branch skips the `mov` that would make it 1, so the
    answer is 1 exactly when the branch is not taken. Invert `blt` to recover
    the relation.
  - Two `s32` arguments and an `s32` result that is only ever 0 or 1 — the
    comparison itself is the return value, with no `if` around it.
---

# Seed zero, then overwrite it with one

A relation used as a *value* rather than as a branch condition still has to be
built out of branches, because Thumb has no conditional execution and no
set-flag-to-register instruction. gcc 2.9 has one general recipe: put 0 in a
register, compare, jump over a `mov #1` when the relation is false, and deliver
whatever survived.

```asm
0        mov       r1, #0
2        cmp       r0, #7
4        ble       8 ~>
6        mov       r1, #1
8      ~>mov       r0, r1
10       bx        lr
```

Six instructions for something that reads as one operator in C. The seed at
address 0 runs before the compare — it is not part of either outcome, it is the
false answer written down in advance. `ble` is the inversion of the relation
that was written, exactly as for a guarded statement, because the `mov #1` is a
body being skipped.

The last `mov r0, r1` looks like waste, and sometimes it is; here it is the
consequence of the compare needing `r0` to hold the value under test while the
result accumulates somewhere else. Make the value under test unsigned and move
the bound, and everything but the branch stays where it was:

```asm
0        mov       r1, #0
2        cmp       r0, #39
4        bhi       8 ~>
6        mov       r1, #1
8      ~>mov       r0, r1
10       bx        lr
```

Same six instructions and the same two registers, with an unsigned branch and a
compare constant nudged down by one the way any `<` against a constant is — the
bound in the source is 40. Both of those readings come from earlier lessons, and
the seed-and-overwrite shape wrapped around them changes neither.

Some relations escape the recipe. `a != b` as a value comes out branchless: an
`eor`, a `neg`, an `orr` and a shift. `x < 0` collapses to a single `lsr #31`,
and `x >= 0` to an `mvn` in front of that same shift. Seeing the full
seed-compare-branch-set shape in a target rules all of those out before you
start.

Your target uses the shape above with two registers and a signed branch.

## Your task

Write `func_08139a64` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08139a64(s32 a, s32 b) {
    return a >= b;
}
```
