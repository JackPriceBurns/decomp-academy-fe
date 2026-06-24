---
id: gauntlet-testbit-4
title: Test bit 4
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 4) & 1`.
  - It folds to a single `rlwinm` that drops bit 4 to the bottom.
---

# Test bit 4

To extract a single bit as a 0/1 value, right-shift the input so the target bit lands at bit position 0, then AND with 1 to discard everything else. MWCC folds the shift and the mask into a single **`rlwinm`**: it rotates the word so the target bit ends up at bit 31 (the LSB in PowerPC numbering) and masks off all other bits.

For example, isolating bit 7 of a `u32` compiles to:

```
rlwinm  r3,r3,25,31,31
blr
```

The rotation amount encodes how far the target bit had to travel to reach position 31. Look at the `rlwinm` in the assembly below: the rotation amount tells you which bit position is being extracted, which in turn tells you the shift count to use in C.

## Your task
Write `testb` on a `u32`, returning bit 4 of `x` as 0 or 1.

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
    return (x >> 4) & 1;
}
```
