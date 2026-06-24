---
id: gauntlet-setbit-15
title: Set bit 15
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 15 is mask 0x8000.
  - "OR it in: `x | 0x8000`."
---

# Set bit 15

Setting a single bit is `x |= 0x8000`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 15 set.

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
    return x | 0x8000;
}
```
