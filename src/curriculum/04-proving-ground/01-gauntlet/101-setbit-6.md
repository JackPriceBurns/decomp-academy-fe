---
id: gauntlet-setbit-6
title: Set bit 6
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 6 is mask 0x40.
  - "OR it in: `x | 0x40`."
---

# Set bit 6

To force a single bit high without disturbing others, OR the value with a mask that has exactly that bit set. When the mask fits in 16 bits, MWCC emits a single **`ori`**; a mask that reaches into the upper half uses `oris` instead.

For example, setting bit 4 (mask `0x10`) compiles to:

```asm
ori     r3,r3,16
```

The immediate `16` is `0x10` in decimal — the mask for bit 4. For a different bit, work out its mask value and apply the same OR idiom.

## Your task
Write `setb` on a `u32`, returning `x` with bit 6 set.

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
    return x | 0x40;
}
```
