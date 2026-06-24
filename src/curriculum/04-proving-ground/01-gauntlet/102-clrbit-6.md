---
id: gauntlet-clrbit-6
title: Clear bit 6
difficulty: 2
concepts:
  - bitwise
  - rlwinm
symbol: clrb
hints:
  - Clear with `x &= ~mask` — the complement operator `~` is what yields the
    efficient rlwinm instruction.
  - Use `x & ~0x40`.
---

# Clear bit 6

To force a single bit low without disturbing others, AND the value with a mask that has every bit set *except* the target. The C idiom uses the bitwise complement operator `~` applied to a single-bit mask.

Because the complement of a single-bit mask is always a contiguous run of ones (a "clear-one-bit" mask), MWCC can encode it as a single **`rlwinm`** rather than a two-instruction sequence.

For example, clearing bit 4 compiles to:

```asm
rlwinm  r3,r3,0,28,26
```

The rotation is 0 (no shift needed); the `MB`/`ME` fields define a mask that covers all bits except bit 4. For a different target bit, the mask bounds change — but the instruction is always a single `rlwinm`.

## Your task
Write `clrb` on a `u32`, returning `x` with bit 6 cleared.

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
    return x & ~0x40;
}
```
