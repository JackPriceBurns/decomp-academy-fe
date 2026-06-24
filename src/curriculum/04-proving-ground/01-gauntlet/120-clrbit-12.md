---
id: gauntlet-clrbit-12
title: Clear bit 12
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x1000`.
---

# Clear bit 12

To force a single bit to 0, AND the value with a mask that has every bit set *except* the target. The C complement operator `~` produces that pattern from a single-bit constant. Because the complement of one bit is a contiguous run of ones, MWCC encodes the whole operation as a single **`rlwinm`** rather than a multi-instruction AND. For example, clearing bit 5 compiles to:

```
clr_ex:
  rlwinm  r3,r3,0,27,25
  blr
```

The `rlwinm` encodes a rotate of 0 with a bit-range mask that leaves everything intact except the target bit. Apply the same idiom for the bit number in the title.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 12 cleared.

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
    return x & ~0x1000;
}
```
