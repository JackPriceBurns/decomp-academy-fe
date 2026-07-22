---
id: b4ba44a6-73db-53d1-80df-9a5c6d84b7da
slug: int64-compare
title: Comparing 64-bit Integers
difficulty: 3
concepts:
  - 64-bit
  - comparison
  - branchless
symbol: lt_64
hints:
  - A branchless u64 `a < b` is built from the subtract-with-borrow pair plus a trick to extract the borrow.
  - "`subfc`/`subfe` do the 64-bit subtract; a second `subfe r3,r4,r4` materializes the borrow bit, and `neg` turns it into 0/1."
  - Return type is `int`; both parameters are `u64`. The body is a single relational comparison of the two.
---

# Turning a 64-bit subtract into a boolean

Now and then you'll find a 64-bit subtract whose result nobody uses, followed by
a `subfe` that subtracts a register from itself and a `neg`. That's a comparison.
It runs the subtract-with-borrow from `sub_64`, then keeps only the borrow bit.
Here's an unsigned `a < b` returned as a `0`/`1` boolean:

```asm
subfc  r0, r6, r4     # low:  a_lo - b_lo, set borrow
subfe  r3, r5, r3     # high: a_hi - b_hi - borrow
subfe  r3, r4, r4     # r3 = -1 if a borrow rippled out, else 0
neg    r3, r3         # turn -1/0 into 1/0
blr
```

The first two lines are the subtract you already know, taking `a - b` over both
halves. Line three is where it gets cute. `subfe r3, r4, r4` subtracts a register
from itself, so the value works out to zero, yet it still folds in the borrow the
high `subfe` left in the carry. You end up with `-1` if the subtraction borrowed
and `0` if it didn't. `neg r3, r3` then flips `-1` to `1`, and there's your
branchless boolean.

Comparisons can't be hidden by a downcast either. The answer is one bit already,
so there's nothing to truncate, and a 64-bit compare always shows up as a 64-bit
compare. It's among the surest signs the operands really are `long long`.

## Your task

Write `lt_64`, returning whether `a` is less than `b` (as an `int`).

<!-- solution -->
```c
int lt_64(u64 a, u64 b) {
    return a < b;
}
```
