---
id: gauntlet-setbit-14
title: Set bit 14
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 14 is mask 0x4000.
  - "OR it in: `x | 0x4000`."
---

# Set bit 14

Setting a single bit is `x |= 0x4000`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 14 set.

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
    return x | 0x4000;
}
```
