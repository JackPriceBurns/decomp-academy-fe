---
id: gauntlet-testbit-13
title: Test bit 13
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 13) & 1`.
  - It folds to a single `rlwinm` that drops bit 13 to the bottom.
---

# Test bit 13

To isolate a single bit as a 0/1 integer, you right-shift the value so the
target bit lands in bit 0, then AND with 1 to discard the rest. MWCC
combines both operations into a single **`rlwinm`** — the rotate-and-mask
instruction — rather than emitting a separate shift and a separate AND.

For example, extracting bit 5 from `x` produces:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotation amount (27 = 32 − 5) moves bit 5 into position 31 (the LSB),
and the mask `31,31` keeps only that bit.

Your function tests a *different* bit; read the target assembly to find which
bit position it moves to the LSB and work backward to the C expression.

## Your task
Write `testb` on a `u32`, returning bit 13 of `x` as 0 or 1.

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
    return (x >> 13) & 1;
}
```
