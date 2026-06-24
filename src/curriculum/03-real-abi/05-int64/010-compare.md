---
id: int64-compare
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
  - Return type is `int`; both parameters are `u64`. Write `return a < b;`.
---

# Turning a 64-bit subtract into a boolean

A 64-bit comparison reuses the subtract-with-borrow machinery from `sub_64`, then
extracts the single bit it actually cares about. For an unsigned `a < b`,
returned as a `0`/`1` boolean:

```asm
subfc  r0, r6, r4     # low:  a_lo - b_lo, set borrow
subfe  r3, r5, r3     # high: a_hi - b_hi - borrow
subfe  r3, r4, r4     # r3 = -1 if a borrow rippled out, else 0
neg    r3, r3         # turn -1/0 into 1/0
blr
```

The first two instructions are exactly the 64-bit subtract you already know. The
clever part is the third: **`subfe r3, r4, r4`** subtracts a register from itself,
so the arithmetic is zero — but it still *reads the carry/borrow* left by the
high-word `subfe`. The result is `0` or `-1` depending on whether the full 64-bit
subtraction borrowed (i.e. whether `a < b`). **`neg`** then flips `-1`→`1`, giving
a clean boolean — no branch required.

Crucially, comparisons are **downcast-proof**: the result is already a single
bit, so there's nothing to truncate. A 64-bit compare always looks like a 64-bit
compare, which makes it one of the most reliable confirmations that the values
involved really are `long long`.

## Your task

Write `lt_64`, returning whether `a` is less than `b` (as an `int`).

<!-- starter -->
```c
int lt_64(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
int lt_64(u64 a, u64 b) {
    return a < b;
}
```
