---
id: loops-for-sum
title: The Anatomy of a Counted Loop
difficulty: 1
concepts:
  - for-loop
  - induction-variable
  - control-flow
symbol: sum
hints:
  - Declare an accumulator `s = 0` and an induction variable `i`.
  - A standard `for (i = 0; i < n; i++) s += i;` is exactly this skeleton.
  - The leading `b` to the test means a zero-or-negative `n` runs the body zero
    times.
---

# A loop is just a backward branch

Until now every function ran straight down to its `blr`. A loop adds one new
idea: a **branch that jumps backwards** so the same instructions run again. The
classic shape MWCC emits for a `for` loop puts the **test at the bottom**: the
body sits in the middle, the comparison and the conditional branch sit at the
*bottom*, and a single unconditional `b` at the top jumps *into* that test
first. That leading `b` is what makes the loop behave as **pre-tested** — the
condition is checked before the body ever runs, so the zero-iteration case is
handled. (Two names, one shape: the test is *physically* at the bottom, but
*behaviorally* the loop is pre-tested thanks to that jump-to-test at the top.)

Here is a concrete example — `squares(n)`, which sums the integers from 1
through `n`:

```asm
li   r0, 0          # s = 0
li   r4, 1          # i = 1
b    test           # jump straight to the test (pre-test)
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
test:
cmpw r4, r3         # i <= n ?
ble+ body           # if so, go round again
mr   r3, r0         # return s
blr
```

The variable `i` (here `r4`) that drives the loop is its **induction variable**.
Notice the test is at the bottom, reached first via that leading `b` — if
`n < 1` the body never runs. Your function `sum` counts from 0, not 1, and
stops before `n` rather than at `n`, so both the initializer and the test
condition will differ from this example.

> **A note on optimization.** At the project's full `-O4,p` setting MWCC would
> *unroll* this tiny sum into a long pipelined mess, because it can compute the
> trip count in advance. To study the clean loop skeleton we dial the optimizer
> down one notch with `#pragma optimization_level 1`. Keep that pragma in your
> answer — it is part of the target.

## Your task

Write `sum`, returning the sum `0 + 1 + ... + (n-1)`.

<!-- starter -->
```c
#pragma optimization_level 1
int sum(int n) {
    // accumulate 0 + 1 + ... + (n-1)
    return 0;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int sum(int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) s += i;
    return s;
}
```
