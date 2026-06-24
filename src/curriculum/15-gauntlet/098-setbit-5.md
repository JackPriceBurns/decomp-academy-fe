---
id: gauntlet-setbit-5
title: Set bit 5
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 5 is mask 0x20.
  - "OR it in: `x | 0x20`."
---

# Set bit 5

Setting a single bit is `x |= 0x20`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 5 set.

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
    return x | 0x20;
}
```
