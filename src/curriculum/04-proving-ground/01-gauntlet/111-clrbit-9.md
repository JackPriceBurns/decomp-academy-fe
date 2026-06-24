---
id: gauntlet-clrbit-9
title: Clear bit 9
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x200`.
---

# Clear bit 9

Clearing a single bit means keeping every bit intact except one, which you express by ANDing with the complement of a power-of-two mask. The `~` operator generates a value with exactly one 0 bit and the rest 1s, which is what MWCC needs to emit a single **`rlwinm`** instruction.

For example, clearing bit 5 (`~0x20`) compiles to:

```
rlwinm  r3,r3,0,27,25
blr
```

The rotate is 0 (no actual rotate); the two mask bounds select every bit *except* bit 5. The `rlwinm` encodes the single-bit hole directly, so no `andi` or `andis` is needed.

From the target `rlwinm`'s mask bounds, determine which bit the instruction is zeroing.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 9 cleared.

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
    return x & ~0x200;
}
```
