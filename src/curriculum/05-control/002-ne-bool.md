---
id: control-ne-bool
title: Not-Equal Is Its Own Idiom
difficulty: 2
concepts:
  - comparison
  - boolean
  - idiom
symbol: not_equal
hints:
  - Inequality uses two subtractions ORed together.
  - The sign bit is harvested with `srwi r3, r0, 31`.
---

# Inequality flips the recipe

`a != b` can't reuse the `cntlzw` trick directly — it needs a *non-zero* test
instead of a *zero* test. MWCC computes the difference both ways, ORs them, and
extracts the sign bit of the combination:

```asm
subf r5, r3, r4    # b - a
subf r0, r4, r3    # a - b
or   r0, r5, r0    # nonzero (with bit 31 set somewhere) iff a != b
srwi r3, r0, 31    # pull bit 31 down to 0/1
blr
```

ORing `b - a` with `a - b` guarantees the top bit is set whenever the two
differ (at least one of the two subtractions has bit 31 set), and is exactly
zero when they match. The final `srwi r3, r0, 31` isolates that sign bit as a
clean `0`/`1`. (Edge case: when `a - b` wraps to `INT_MIN`, `b - a` wraps to
`INT_MIN` too, but the OR is still `INT_MIN` so bit 31 stays set and the result
is still correct.)

## Your task

Write `not_equal` to match the target assembly above.

<!-- starter -->
```c
int not_equal(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int not_equal(int a, int b) {
    return a != b;
}
```
