---
id: gauntlet-setbit-12
title: Set bit 12
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 12 is mask 0x1000.
  - "OR it in: `x | 0x1000`."
---

# Set bit 12

To force a single bit to 1, OR the value with a mask that has only that bit set. The PowerPC `ori` instruction encodes a 16-bit unsigned immediate, so any mask whose set bits all fall within the low 16 bits compiles to a single `ori`. For example, setting bit 5 of `x` looks like:

```
set_ex:
  ori     r3,r3,32
  blr
```

A mask whose bits sit above the low 16 requires `oris` instead. Look at the bit number in the title, figure out its mask value, and apply the same pattern.

## Your task
Write `setb` on a `u32`, returning `x` with bit 12 set.

<!-- starter -->
```c
u32 setb(u32 x) {
    // your code here
    return 0;
}
```

<!-- solution -->
```c
u32 setb(u32 x) {
    return x | 0x1000;
}
```
