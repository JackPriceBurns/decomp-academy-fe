---
id: gauntlet-testbit-6
title: Test bit 6
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 6) & 1`.
  - It folds to a single `rlwinm` that drops bit 6 to the bottom.
---

# Test bit 6

Extracting one bit as a 0/1 value is `(x >> 6) & 1`. MWCC folds the shift
and the mask into a single **`rlwinm`** that rotates bit 6 down to the
bottom and keeps only it (bit 0 collapses to a `clrlwi`).

## Your task
Write `testb` on a `u32`, returning bit 6 of `x` as 0 or 1.

<!-- starter -->
```c
u32 testb(u32 x) {
    // your code here
    return 0;
}
```

<!-- solution -->
```c
u32 testb(u32 x) {
    return (x >> 6) & 1;
}
```
