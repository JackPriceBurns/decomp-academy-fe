---
id: gauntlet-testbit-8
title: Test bit 8
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 8) & 1`.
  - It folds to a single `rlwinm` that drops bit 8 to the bottom.
---

# Test bit 8

Isolating a single bit as a 0/1 integer requires two operations: shift the target bit down to position 0, then mask away everything above it. MWCC can fold both into a single **`rlwinm`** that rotates and masks in one step.

For example, extracting bit 5 compiles to:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotate amount (27 = 32 − 5) brings bit 5 to position 31 (the least-significant bit), and the mask `31,31` keeps only that position. The disassembler may show this as `clrlwi` in some contexts, but the encoding is the same `rlwinm` form.

Examine the rotate amount in the target `rlwinm` to determine which bit is being tested.

## Your task
Write `testb` on a `u32`, returning bit 8 of `x` as 0 or 1.

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
    return (x >> 8) & 1;
}
```
