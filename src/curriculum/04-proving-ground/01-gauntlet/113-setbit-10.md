---
id: gauntlet-setbit-10
title: Set bit 10
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 10 is mask 0x400.
  - "OR it in: `x | 0x400`."
---

# Set bit 10

ORing a value with a power-of-two mask forces exactly one bit high. When the mask is small enough to fit in a 16-bit signed immediate, MWCC encodes it as a single **`ori`**; a mask in the upper halfword would require `oris`.

For example, setting bit 7 (`0x80`) compiles to:

```
ori     r3,r3,128
blr
```

The immediate (128 decimal = 0x80) is the mask, not the bit number. Look at the immediate in the target `ori` and convert it to the bit number you need to set.

## Your task
Write `setb` on a `u32`, returning `x` with bit 10 set.

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
    return x | 0x400;
}
```
