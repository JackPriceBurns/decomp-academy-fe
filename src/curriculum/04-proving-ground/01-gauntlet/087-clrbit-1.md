---
id: gauntlet-clrbit-1
title: Clear bit 1
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x2`.
---

# Clear bit 1

To clear a single bit, complement the single-bit mask with `~` and AND it in.
The complement of any single-bit mask is a contiguous run of set bits with a
single hole, which MWCC encodes as one **`rlwinm`** — no multi-instruction
sequence needed.

For example, clearing bit 5 (`~0x20`) from a `u32`:

```c
u32 clr_example(u32 x) {
    return x & ~0x20;
}
```

```asm
clr_example:
    rlwinm  r3,r3,0,27,25
    blr
```

The `rlwinm` keeps every bit except bit 5; the mask wraps around from bit 27
back to bit 25, leaving bit 26 (bit 5 in hardware numbering) zeroed.

Look at the assembly for `clrb` below. Work out which bit is being cleared
from the `rlwinm` operands, then write the equivalent C.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 1 cleared.

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
    return x & ~0x2;
}
```
