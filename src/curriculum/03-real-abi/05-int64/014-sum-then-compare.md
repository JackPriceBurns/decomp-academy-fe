---
id: int64-sum-then-compare
title: "Chaining: A Sum Feeds a 64-bit Compare"
difficulty: 4
concepts:
  - 64-bit
  - arithmetic
  - comparison
  - branchless
  - chaining
symbol: sum_lt_64
hints:
  - Two stages — an arithmetic pair builds a 64-bit value, then the branchless compare machinery (`subfc`/`subfe`/`subfe`/`neg`) tests it.
  - The compare's first subtract takes the computed value as one of its operands, so the running result threads straight into it.
  - Return type is `int`; three `u64` parameters. Combine the first two arithmetically, then compare that against the third.
---

# Computing a value, then testing it

The 64-bit compare from earlier ends in a recognizable four-instruction
flourish: the subtract-with-borrow pair, a `subfe rD, rD, rD` that materializes
the borrow bit, and a `neg` that turns `-1/0` into `1/0`. When the thing being
compared is itself *computed*, those arithmetic instructions simply run first
and feed the compare.

Consider `diff_below(p, q, r)`, which subtracts two 64-bit values and asks
whether the difference is less than a third:

```asm
subfc  r0, r6, r4     # (p - q) low,  set borrow
subfe  r3, r5, r3     # (p - q) high, consume borrow  -> value in r3:r0
subfc  r0, r8, r0     # compare: value - r, low
subfe  r3, r7, r3     # compare: value - r, high
subfe  r3, r4, r4     # extract the borrow:  -1 if value < r, else 0
neg    r3, r3         # -> 1 / 0
blr
```

Read it in two halves. The first `subfc`/`subfe` build `p - q` into `r3:r0`.
The next `subfc`/`subfe` are the *compare's* subtract, taking that computed
value as their input; then the self-subtract `subfe r3, r4, r4` lifts out the
borrow and `neg` makes a clean boolean. The two subtract pairs look alike — the
difference is that the first produces a value and the second exists only to set
the borrow flag for the `neg` trick.

The target computes its left operand with a *different* arithmetic operation
before the same compare tail. Spot where the arithmetic pair ends and the
compare machinery begins, read the first pair to recover the operation, and note
which way the relation points.

## Your task

Write `sum_lt_64`, taking three `u64`s and returning an `int`, to reproduce the
assembly above.

<!-- starter -->
```c
int sum_lt_64(u64 a, u64 b, u64 c) {
    return 0;
}
```

<!-- solution -->
```c
int sum_lt_64(u64 a, u64 b, u64 c) {
    return (a + b) < c;
}
```
