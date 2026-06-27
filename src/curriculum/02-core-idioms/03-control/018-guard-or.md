---
id: control-guard-or
title: A Multi-Condition Guard
difficulty: 3
concepts:
  - guard
  - short-circuit
  - early-return
  - combining
symbol: safe_scale
hints:
  - A `||` guard is two compares that both bail to the *same* early-return block.
  - After both checks pass, the real work runs at the branch target (a `divw`,
    `mullw`, …).
---

# Guarding with more than one condition

Lesson 8's guard bailed out on a single bad input. Real preconditions usually
have several. Joining them with `||` — "bail if this *or* that is wrong" — gives
a guard whose two compares both branch to the *same* sentinel block, and whose
fall-through runs the real computation. It's the `||` shape of lesson 16, but
now one arm does genuine work instead of returning a constant.

Consider `safe_avg(sum, count)`: it refuses a non-positive count or a negative
sum, otherwise divides:

```asm
cmpwi r4,0         # count <= 0 ?
ble-  .bail        # yes -> bail out
cmpwi r3,0         # sum < 0 ?
bge-  .work        # no (sum >= 0) -> proceed to the work
.bail:
li    r3,-1        # sentinel for a rejected call
blr
.work:
divw  r3,r3,r4     # the real computation
blr
```

Two compares feed one shared `.bail` block — that shared early-return target is
what marks both branches as halves of a single `||` guard. The *first* failing
condition jumps straight to the sentinel; the *last* condition, if it passes,
falls through to the real work. The instruction at `.work` (here `divw`) tells
you what the function actually computes once its inputs are trusted.

Your target guards two different conditions and finishes with a different
operation. Identify the two compares, confirm they share one bailout, read the
sentinel value, and recover the computation at the fall-through.

## Your task

Write `safe_scale`, taking a value `x` and a `factor`, to reproduce the assembly
above.

<!-- starter -->
```c
int safe_scale(int x, int factor) {
    return 0;
}
```

<!-- solution -->
```c
int safe_scale(int x, int factor) {
    if (factor <= 0 || x == 0) return 0;
    return x * factor;
}
```
