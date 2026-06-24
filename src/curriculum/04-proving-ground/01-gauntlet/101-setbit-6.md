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

Setting a single bit is `x |= 0x40`. A mask that fits the
`ori` immediate becomes one **`ori`**; a high mask uses `oris`.

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
