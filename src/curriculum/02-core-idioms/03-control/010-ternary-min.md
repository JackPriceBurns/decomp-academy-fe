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

Recall how `max` works: compare `r3` and `r4`, then conditionally copy the
larger into the return register using a pair of `mr` instructions. The `min`
idiom has the same two-`mr` skeleton — the **only** difference is a single bit
in the branch condition.

`max` uses `ble-` (branch if ≤ to skip the copy), which means "if `a` is
already ≤ `b`, keep `b`". Flipping to `bge-` (branch if ≥) inverts the
selection: "if `a` is already ≥ `b`, keep `b`" — but now `a < b` is the case
where we stage `a` for the result, so we're returning the *smaller* value.

To see the structural difference, here is the `max` assembly for reference:

```asm
cmpw r3, r4
ble- .else       # a <= b -> b is already the larger; skip the copy
mr   r4, r3      # a is larger: stage it as the result
.else:
mr   r3, r4
blr
```

Study that branch condition carefully. The `min` pattern is identical except
for one mnemonic change — find what the branch condition must become so that
the *smaller* argument ends up in `r3`.

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
