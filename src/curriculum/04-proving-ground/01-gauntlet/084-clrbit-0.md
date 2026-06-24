---
id: gauntlet-clrbit-0
title: Clear bit 0
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x1`.
---

# Clear bit 0

To clear a single bit in PowerPC, complement the mask with `~` and AND it in.
The complement of any single-bit mask is a contiguous run of set bits, which
MWCC can encode as one **`rlwinm`** — rotating by zero and specifying the
mask boundaries to exclude the target bit.

For example, clearing bit 5 (`~0x20`) from a `u32` looks like this:

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

The `rlwinm` keeps every bit except bit 5 (the mask runs from bit 27 down to
bit 25 wrapping, skipping 26). No two-instruction sequence is needed.

Look at the assembly for `clrb` below and work out which bit is being cleared,
then apply the same idiom.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 0 cleared.

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
    return x & ~0x1;
}
```
