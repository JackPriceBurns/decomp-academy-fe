---
id: gauntlet-setbit-13
title: Set bit 13
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 13 is mask 0x2000.
  - "OR it in: `x | 0x2000`."
---

# Set bit 13

Setting a single bit is `x |= 0x2000`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 13 set.

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
    return x | 0x2000;
}
```
