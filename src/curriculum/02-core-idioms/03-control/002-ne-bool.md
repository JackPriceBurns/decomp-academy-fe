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

The equality recipe from the previous lesson used `cntlzw` to detect a zero
result. Testing for a non-zero result needs a different idiom — MWCC computes
the difference between the two inputs in *both directions*, ORs them together,
and extracts the top bit of the combination:

```asm
subf r5, r3, r4    # one direction
subf r0, r4, r3    # the other direction
or   r0, r5, r0    # combine
srwi r3, r0, 31    # pull bit 31 down to 0/1
blr
```

ORing two subtractions computed in opposite directions guarantees bit 31 is set
whenever the two inputs differ (at least one subtraction overflows into bit 31),
and the OR is exactly zero when they match. The final `srwi r3, r0, 31` isolates
that sign bit as a clean `0`/`1`. (Edge case: when one difference wraps to
`INT_MIN`, the other wraps to `INT_MIN` too, so the OR is still `INT_MIN` and
bit 31 stays set — the result is still correct.)

## Your task

Write `not_equal`, taking two `int`s, to reproduce the assembly above.

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
