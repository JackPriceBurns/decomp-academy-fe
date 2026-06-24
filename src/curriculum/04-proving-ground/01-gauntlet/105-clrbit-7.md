---
id: gauntlet-clrbit-7
title: Clear bit 7
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x80`.
---

# Clear bit 7

To force a single bit low without disturbing others, AND the value with a complement mask — every bit set except the target. Use the `~` operator on a single-bit mask to produce that complement.

Because the complement of a one-bit mask is always a contiguous run of ones, MWCC can encode it as a single **`rlwinm`** rather than a two-instruction sequence.

For example, clearing bit 4 compiles to:

```asm
rlwinm  r3,r3,0,28,26
```

The rotation is 0; the `MB`/`ME` fields mark out all bits except bit 4. For a different target bit, figure out which bit to complement and apply the same idiom.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 7 cleared.

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
    return x & ~0x80;
}
```
