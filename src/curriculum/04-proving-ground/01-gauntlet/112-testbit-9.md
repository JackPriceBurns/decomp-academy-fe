---
id: gauntlet-testbit-9
title: Test bit 9
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 9) & 1`.
  - It folds to a single `rlwinm` that drops bit 9 to the bottom.
---

# Test bit 9

To produce a 0/1 result from an arbitrary bit, you shift that bit down to position 0 and mask off everything above it. MWCC combines both operations into a single **`rlwinm`** — a rotate-left that effectively shifts right, with mask bounds that isolate bit 0.

For example, extracting bit 5 compiles to:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotate count of 27 comes from 32 − 5, moving bit 5 into position 31 (the LSB). The `31,31` mask then zeroes every other bit. The disassembler may print this as `clrlwi` in some encodings.

Read the rotate count in the target instruction to work out which bit is being isolated.

## Your task
Write `testb` on a `u32`, returning bit 9 of `x` as 0 or 1.

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
    return (x >> 9) & 1;
}
```
