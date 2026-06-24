---
id: gauntlet-testbit-2
title: Test bit 2
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 2) & 1`.
  - It folds to a single `rlwinm` that drops bit 2 to the bottom.
---

# Test bit 2

To read a single bit as a 0/1 value, shift it down to position 0 and mask
off everything else. MWCC combines both steps into one **`rlwinm`**: it
rotates the word so the chosen bit ends up at the LSB, then applies a mask
that keeps only that bit.

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

The rotation amount `25` equals `32 - 7`, bringing bit 7 to the LSB; the
mask `31,31` zeroes every other bit. A rotation of `32 - N` always corresponds
to shifting right by N.

Look at the rotation amount in the assembly for `testb` below. Work backward
to find which bit it targets, then write the C shift-and-mask expression.

## Your task
Write `testb` on a `u32`, returning bit 2 of `x` as 0 or 1.

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
    return (x >> 2) & 1;
}
```
