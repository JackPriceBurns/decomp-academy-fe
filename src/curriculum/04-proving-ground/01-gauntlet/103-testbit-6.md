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

To isolate a single bit as a 0 or 1, you shift the value right until that bit lands in bit position 0, then mask everything else away. MWCC folds both operations into a single **`rlwinm`** instruction.

For example, extracting bit 2 compiles to:

```asm
rlwinm  r3,r3,30,31,31
```

The rotation amount is `32 - 2 = 30` (left-rotate by 30 is the same as right-shift by 2), and the mask `31,31` keeps only the lowest bit. For a different bit position, the rotation and mask bounds change accordingly.

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
