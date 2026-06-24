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

Setting a single bit uses a bitwise OR against a mask that has only the
target bit active. When the mask value fits in 16 unsigned bits, MWCC emits
**`ori`** with the mask as the immediate. When the relevant bit lies in the
upper half of the word, MWCC uses **`oris`** instead because `ori` only
reaches the bottom 16 bits.

For example, setting bit 7 (mask `0x0080`) produces:

```
ori     r3,r3,128
blr
```

Look at the immediate in the target instruction to identify which bit the
mask corresponds to, then write the OR expression that sets it.

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
