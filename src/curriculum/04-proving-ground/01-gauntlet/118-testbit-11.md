---
id: gauntlet-testbit-11
title: Test bit 11
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 11) & 1`.
  - It folds to a single `rlwinm` that drops bit 11 to the bottom.
---

# Test bit 11

To extract a single bit as a 0/1 integer, shift it down to bit position 0 then mask off everything above it. MWCC folds both operations into one **`rlwinm`** that rotates the target bit to the bottom and zeros everything else. For example, testing bit 5 compiles to:

```
test_ex:
  rlwinm  r3,r3,27,31,31
  blr
```

The rotate amount moves bit 5 to bit 0; the mask `31,31` keeps only that position. Determine the equivalent rotation and mask for the bit number in the title.

## Your task
Write `testb` on a `u32`, returning bit 11 of `x` as 0 or 1.

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
    return (x >> 11) & 1;
}
```
