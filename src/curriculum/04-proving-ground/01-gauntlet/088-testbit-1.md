---
id: gauntlet-testbit-1
title: Test bit 1
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 1) & 1`.
  - It folds to a single `rlwinm` that drops bit 1 to the bottom.
---

# Test bit 1

To test whether a particular bit is set, shift it down to position 0 and
mask off all other bits. MWCC folds both steps into one **`rlwinm`**: it
rotates the target bit to the least-significant position and zeroes
everything else with a single mask.

For example, testing bit 7:

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

The rotation is `32 - 7 = 25`; the mask `31,31` retains only the new LSB.

Look at the assembly for `testb` below and identify which bit position is
being tested from the rotation amount, then write the matching C expression.

## Your task
Write `testb` on a `u32`, returning bit 1 of `x` as 0 or 1.

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
    return (x >> 1) & 1;
}
```
