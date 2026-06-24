---
id: gauntlet-clrbit-8
title: Clear bit 8
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x100`.
---

# Clear bit 8

To clear a single bit you need a mask with that bit set to 0 and all others 1 — exactly the *complement* of a power-of-two. The `~` operator produces that complement, so a pattern like `x & ~mask` gives MWCC enough information to emit a single **`rlwinm`** instruction instead of a multi-instruction sequence.

For example, clearing bit 5 (`~0x20`) compiles to:

```
rlwinm  r3,r3,0,27,25
blr
```

The `rlwinm` rotates by 0 and selects all bits *except* bit 5, leaving the result in `r3`. The instruction encodes both the "keep" range and the "zero" bit in one word — no `andi` needed.

Look at the target assembly's `rlwinm` operands to determine which bit it is zeroing.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 8 cleared.

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
    return x & ~0x100;
}
```
