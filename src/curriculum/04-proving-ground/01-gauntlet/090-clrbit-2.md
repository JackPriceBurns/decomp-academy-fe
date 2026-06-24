---
id: gauntlet-clrbit-2
title: Clear bit 2
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x4`.
---

# Clear bit 2

Clearing a single bit means ANDing with the complement of a single-bit mask.
Because the complement of any single-bit mask is a contiguous run of ones
with one gap, MWCC can express it as a single **`rlwinm`** — the instruction
encodes a mask range that simply skips the target bit.

For example, clearing bit 5 (mask complement `~0x20`):

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

The rotation is 0; the mask range `27,25` wraps around and excludes bit 26
(PowerPC bit numbering for position 5 from the LSB).

Read the `rlwinm` in the assembly for `clrb` below and determine which bit
is being punched out, then reconstruct the C expression.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 2 cleared.

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
    return x & ~0x4;
}
```
