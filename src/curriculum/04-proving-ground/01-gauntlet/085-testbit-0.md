---
id: gauntlet-testbit-0
title: Test bit 0
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 0) & 1`.
  - It folds to a single `rlwinm` that drops bit 0 to the bottom.
---

# Test bit 0

To extract a single bit as a 0/1 value, shift it down to position 0 and
mask off everything else. MWCC folds both steps into one **`rlwinm`** that
rotates the target bit into the least-significant position and zeroes the
rest.

For example, testing bit 7 looks like this:

```c
u32 test_example(u32 x) {
    return (x >> 7) & 1;
}
```

```asm
test_example:
    rlwinm  r3,r3,25,31,31
    blr
```

The rotation amount is `32 - 7 = 25`, bringing bit 7 down to bit 31 (the
LSB on a big-endian 32-bit word), and the mask `31,31` keeps only that bit.

Study the assembly for `testb` below. Identify which bit position is being
tested, then express it with the same shift-and-mask pattern.

## Your task
Write `testb` on a `u32`, returning bit 0 of `x` as 0 or 1.

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
    return (x >> 0) & 1;
}
```
