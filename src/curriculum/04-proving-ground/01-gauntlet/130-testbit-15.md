---
id: gauntlet-testbit-15
title: Test bit 15
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: testb
hints:
  - Isolate the bit with `(x >> 15) & 1`.
  - It folds to a single `rlwinm` that drops bit 15 to the bottom.
---

# Test bit 15

Pulling a single bit out as a 0/1 result requires shifting the target bit
down to position 0 and masking off everything above it. MWCC folds both
steps into one **`rlwinm`** — a rotate-left-word-immediate-then-mask that
moves the bit to the LSB and zeros all others simultaneously.

For example, extracting bit 5 from `x` produces:

```
rlwinm  r3,r3,27,31,31
blr
```

The rotation value 27 equals 32 − 5, placing bit 5 at the LSB; the mask
`31,31` keeps only that position. Use the rotation amount in the target
`rlwinm` to determine which bit is being tested, then write the C expression
that extracts it.

## Your task
Write `testb` on a `u32`, returning bit 15 of `x` as 0 or 1.

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
    return (x >> 15) & 1;
}
```
