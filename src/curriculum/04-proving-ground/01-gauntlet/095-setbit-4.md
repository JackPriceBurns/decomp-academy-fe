---
id: gauntlet-setbit-4
title: Set bit 4
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 4 is mask 0x10.
  - "OR it in: `x | 0x10`."
---

# Set bit 4

Setting a single bit is `x |= 0x10`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 4 set.

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
    return x | 0x10;
}
```
