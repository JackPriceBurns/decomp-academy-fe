---
id: gauntlet-testbit-5
title: Test bit 5
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 5) & 1`.
  - It folds to a single `rlwinm` that drops bit 5 to the bottom.
---

# Test bit 5

To isolate a single bit as a 0 or 1, you shift the value right until that bit lands in bit position 0, then mask everything else away with `& 1`. MWCC folds both the shift and the mask into a single **`rlwinm`** instruction.

For example, extracting bit 2 compiles to:

```asm
rlwinm  r3,r3,30,31,31
```

`rlwinm` rotates `r3` left by 30 (which is the same as shifting right by 2 on a 32-bit value), then masks so only bit 31 (the lowest bit) survives.

For a different bit position, the rotation amount and mask bounds shift accordingly — work out what shift and mask targets bit 5, and let the compiler fold it.

## Your task
Write `testb` on a `u32`, returning bit 5 of `x` as 0 or 1.

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
    return (x >> 5) & 1;
}
```
