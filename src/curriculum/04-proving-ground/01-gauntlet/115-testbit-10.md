---
id: gauntlet-testbit-10
title: Test bit 10
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 10) & 1`.
  - It folds to a single `rlwinm` that drops bit 10 to the bottom.
---

# Test bit 10

Reading a single bit as an integer 0 or 1 requires shifting it down to position 0 then masking everything else away. MWCC collapses the shift and AND into a single **`rlwinm`** whose rotate and mask fields do both jobs simultaneously.

For example, extracting bit 5 compiles to:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotate count 27 = 32 − 5 moves bit 5 to bit position 31 (the LSB). The mask `31,31` zeroes all other bits. Only one instruction is emitted.

Find the rotate count in the target `rlwinm`, subtract it from 32 to recover the bit number, then write the C that isolates that bit.

## Your task
Write `testb` on a `u32`, returning bit 10 of `x` as 0 or 1.

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
    return (x >> 10) & 1;
}
```
