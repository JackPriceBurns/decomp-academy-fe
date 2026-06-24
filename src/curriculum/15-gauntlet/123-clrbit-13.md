---
id: gauntlet-clrbit-13
title: Clear bit 13
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x2000`.
---

# Clear bit 13

Write the clear as `x &= ~0x2000`. Because the *complement* of a
single bit is a contiguous run of ones, MWCC emits a single **`rlwinm`** (clear
one bit) rather than a two-immediate `andi` — the idiom from the bitwise chapter.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 13 cleared.

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
    return x & ~0x2000;
}
```
