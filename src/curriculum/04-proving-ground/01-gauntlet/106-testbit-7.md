---
id: gauntlet-testbit-7
title: Test bit 7
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 7) & 1`.
  - It folds to a single `rlwinm` that drops bit 7 to the bottom.
---

# Test bit 7

To read a single bit as a 0 or 1, shift it down to bit position 0 then mask away everything else. MWCC combines both steps into a single **`rlwinm`** instruction.

For example, extracting bit 2 compiles to:

```asm
rlwinm  r3,r3,30,31,31
```

`rlwinm` rotates left by 30 (equivalent to a right shift by 2 on a 32-bit word) and keeps only bit 31 (the lowest position). For a higher bit number, the rotation amount decreases and the mask bounds stay the same — work out the right rotation for bit 7.

## Your task
Write `testb` on a `u32`, returning bit 7 of `x` as 0 or 1.

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
    return (x >> 7) & 1;
}
```
