---
id: gauntlet-setbit-9
title: Set bit 9
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 9 is mask 0x200.
  - "OR it in: `x | 0x200`."
---

# Set bit 9

Setting a single bit is `x |= 0x200`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

## Your task
Write `setb` on a `u32`, returning `x` with bit 9 set.

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
    return x | 0x200;
}
```
