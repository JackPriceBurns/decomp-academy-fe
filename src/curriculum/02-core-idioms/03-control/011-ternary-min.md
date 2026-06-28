---
id: control-ternary-min
title: Ternary Min
difficulty: 3
concepts:
  - ternary
  - comparison
  - select
symbol: mini
hints:
  - "`a < b ? a : b` is min; the only change from max is `bge-` instead of
    `ble-`."
  - The `mr r4, r3` / `mr r3, r4` merge is the same as max.
---

# The mirror image

You already saw `max`. Compare `r3` against `r4`, then conditionally copy the
larger of the two into the return register with a pair of `mr` instructions.
`min` reuses that exact two-`mr` skeleton. The only thing that moves is a single
bit in the branch condition.

In `max` the branch is `ble-`. It skips the copy whenever `a` is already ≤ `b`,
which leaves `b` sitting in place to be returned. Swap `ble-` for `bge-` and the
choice inverts. The copy is now skipped when `a` is already ≥ `b`, so the case
that stages `a` becomes `a < b`, and the value that survives to the end is the
*smaller* one rather than the larger.

Here is the `max` listing once more, to hold up against your answer:

```asm
cmpw r3, r4
ble- .else       # a <= b -> b is already the larger; skip the copy
mr   r4, r3      # a is larger: stage it as the result
.else:
mr   r3, r4
blr
```

Look hard at that branch line. The `min` version is the same code with exactly
one mnemonic changed. Work out what the condition has to become so the *smaller*
argument is the one that lands in `r3`.

## Your task

Write `mini`, returning the smaller of two signed `int`s using a ternary.

<!-- starter -->
```c
int mini(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int mini(int a, int b) {
    return a < b ? a : b;
}
```
