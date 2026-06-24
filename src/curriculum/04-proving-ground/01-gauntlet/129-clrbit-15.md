---
id: gauntlet-clrbit-15
title: Clear bit 15
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x8000`.
---

# Clear bit 15

Clearing a single bit uses AND against a mask that is all ones except at the
bit position to erase. The `~` complement operator generates that mask in C.
Because the complement of a single-bit mask is a contiguous block of ones
(a rotate-and-mask window), MWCC emits a single **`rlwinm`** rather than the
two immediates that `andi`/`andis` would require for an arbitrary mask.

For example, clearing bit 9 (complement of mask `0x0200`) produces:

```
rlwinm  r3,r3,0,23,21
blr
```

The `rlwinm` with rotation 0 and mask `23,21` keeps every bit except bit 9
(PowerPC bit 22 in MSB-first numbering = LSB-first bit 9). Read the target
assembly's mask range to figure out which bit is being cleared, then write
the C idiom that produces it.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 15 cleared.

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
    return x & ~0x8000;
}
```
