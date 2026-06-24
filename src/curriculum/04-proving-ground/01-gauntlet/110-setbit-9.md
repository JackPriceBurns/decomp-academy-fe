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

Setting a bit requires ORing the value with a mask that has only that bit high. If the mask fits in the 16-bit `ori` immediate, MWCC emits a single **`ori`**; a mask in the upper 16 bits uses `oris` instead.

For example, setting bit 7 (`0x80`) compiles to:

```
ori     r3,r3,128
blr
```

The immediate is the decimal value of the mask (128 = 0x80). Identify the bit position from the assembly's immediate, then write the OR expression that sets exactly that bit.

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
