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

Setting a single bit uses a bitwise OR against a mask with only that bit
active. When the mask value fits in 16 bits, MWCC emits a single **`ori`**
instruction. When the set bit is in the upper 16 bits of the word, MWCC uses
**`oris`** instead.

For example, setting bit 7 (mask `0x0080`) produces:

```
ori     r3,r3,128
blr
```

The immediate 128 (= 0x80) is the mask for bit 7. Identify the bit number
in the target assembly, figure out the corresponding mask, and use OR to
produce it.

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
