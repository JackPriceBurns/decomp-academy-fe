---
id: 2aeb6c23-671d-527b-90be-6abebc8cf6fc
slug: loops-for-sum
title: The Anatomy of a Counted Loop
difficulty: 1
concepts:
  - for-loop
  - induction-variable
  - control-flow
symbol: func_802badb0
hints:
  - Declare an accumulator `s = 0` and an induction variable `i`.
  - A standard `for (i = 0; i < n; i++) s += i;` is exactly this skeleton.
  - The leading `b` to the test means a zero-or-negative `n` runs the body zero
    times.
---

# A loop is just a backward branch

Up to now control has only flowed downhill toward `blr`. A loop bends that line
back on itself with a single **branch that jumps backwards**, letting the same
instructions run more than once. Watch how MWCC threads a `for` loop. You enter
at a `b` that skips ahead to the comparison; the comparison decides whether any
work remains, and when it passes, control drops into the body. The body runs,
bumps the counter, and lands back on that same comparison. The test is reached
first, so the body can run zero times when the count begins empty. The loop is
**pre-tested**; the jump-first wiring just makes it behave that way even though
the compare physically sits at the bottom.

Take `squares(n)`, which totals the integers from 1 up through `n`:

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

The counter driving all this, `i` over in `r4`, is the loop's **induction
variable**. And notice where the test lands, down at the bottom, reached first by
way of that leading `b`, which is exactly why an `n` under 1 leaves the body
untouched. Your own `func_802badb0` counts from 0 rather than 1 and quits one short of `n`
instead of including it, so its starting value and its test won't match the ones
here.

> **A note on optimization.** Turn the dial up to the project's real `-O4,p` and
> MWCC *unrolls* this little sum into a sprawling pipelined mess, having figured
> out the trip count in advance. To keep the skeleton legible, we back the
> optimizer off by one notch with `#pragma optimization_level 1`. Don't drop that
> pragma; it's genuinely part of the target.

## Your task

Write `func_802badb0`, returning the sum `0 + 1 + ... + (n-1)`.

<!-- starter -->
```c
#pragma optimization_level 1
// define func_802badb0 to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int func_802badb0(int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) s += i;
    return s;
}
```
