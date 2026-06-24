---
id: gauntlet-clrbit-10
title: Clear bit 10
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x400`.
---

# Clear bit 10

A bit-clear keeps every bit intact except one target bit. The complement operator `~` applied to a single-bit mask produces exactly that pattern — all ones with a single zero — which MWCC can encode directly into **`rlwinm`**'s mask fields without needing a separate `andi`.

For example, clearing bit 5 (`~0x20`) compiles to:

```
rlwinm  r3,r3,0,27,25
blr
```

The `rlwinm` rotates by 0 (no rotation) and uses mask bounds `27,25` to select every bit except bit 5. Notice the mask bounds skip over the bit being cleared.

Use the mask bounds of the target `rlwinm` to identify which bit is being zeroed, then write the corresponding C expression.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 10 cleared.

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
    return x & ~0x400;
}
```
