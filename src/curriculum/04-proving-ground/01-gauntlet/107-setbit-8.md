---
id: gauntlet-setbit-8
title: Set bit 8
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 8 is mask 0x100.
  - "OR it in: `x | 0x100`."
---

# Set bit 8

To force a single bit high without disturbing others, OR the value with a mask that has exactly that bit set. When the mask fits in 16 bits, MWCC emits a single **`ori`**; a mask that reaches into the upper half uses `oris` instead.

For example, setting bit 4 (mask `0x10`) compiles to:

```asm
ori     r3,r3,16
```

The immediate `16` is `0x10` — the mask for bit 4. Identify the mask for bit 8 and apply the same OR approach.

## Your task
Write `setb` on a `u32`, returning `x` with bit 8 set.

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
    return x | 0x100;
}
```
