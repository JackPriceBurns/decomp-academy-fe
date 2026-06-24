---
id: gauntlet-clrbit-4
title: Clear bit 4
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x10`.
---

# Clear bit 4

To force a specific bit to 0, AND the value with the bitwise complement of that bit's mask. The complement of a single set bit is a contiguous run of ones with one hole — a shape that MWCC encodes as a single **`rlwinm`** (rotate left with mask) rather than a two-instruction `andi`/`andis` sequence.

For example, clearing bit 6 of a `u32` (mask `0x40`, complement `~0x40`) compiles to:

```
rlwinm  r3,r3,0,26,24
blr
```

The `rlwinm` here rotates by 0 (no rotation) and applies a mask that keeps everything except bit 6. Look at the assembly below: the mask bounds encoded in the instruction reveal which bit position is being cleared. Work out the mask, then write the `&` expression that produces it.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 4 cleared.

<!-- starter -->
```c
u32 clrb(u32 x) {
    // your code here
    return 0;
}
```

<!-- solution -->
```c
u32 clrb(u32 x) {
    return x & ~0x10;
}
```
