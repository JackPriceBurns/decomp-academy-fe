---
id: gauntlet-testbit-14
title: Test bit 14
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 14) & 1`.
  - It folds to a single `rlwinm` that drops bit 14 to the bottom.
---

# Test bit 14

To isolate a single bit as a 0/1 integer, you right-shift the value so the
target bit lands in bit 0, then AND with 1 to discard everything else. MWCC
fuses both operations into one **`rlwinm`** — it rotates the chosen bit into
the LSB and masks all others to zero in a single instruction.

For example, extracting bit 5 from `x` produces:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotation amount (27 = 32 − 5) brings bit 5 to position 31 (the LSB);
the mask `31,31` zeros every other bit.

Your function tests a *different* bit. Inspect the rotation amount in the
target `rlwinm` to find the bit position, then write the C that produces it.

## Your task
Write `testb` on a `u32`, returning bit 14 of `x` as 0 or 1.

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
    return (x >> 14) & 1;
}
```
