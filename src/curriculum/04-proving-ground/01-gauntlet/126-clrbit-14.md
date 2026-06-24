---
id: gauntlet-clrbit-14
title: Clear bit 14
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x4000`.
---

# Clear bit 14

Clearing a single bit uses AND against a mask that has every bit set *except*
the one to erase. The `~` complement operator is the idiomatic way to form
that mask in C. Because the complement of a single-bit mask is a contiguous
run of ones (a rotated window), MWCC emits a single **`rlwinm`** rather
than a two-immediate `andi`.

For example, clearing bit 9 (mask `~0x0200`) produces:

```
rlwinm  r3,r3,0,23,21
blr
```

The `rlwinm` rotation 0 with mask `23,21` leaves all bits intact except bit 9
(PowerPC bit numbering counts from the MSB). Read the target assembly to
identify which bit position is being masked out, then form the C expression
that clears it.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 14 cleared.

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
    return x & ~0x4000;
}
```
