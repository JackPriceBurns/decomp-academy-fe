---
id: gauntlet-setbit-1
title: Set bit 1
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 1 is mask 0x2.
  - "OR it in: `x | 0x2`."
---

# Set bit 1

Setting a single bit uses OR with a mask whose only set bit is the target.
When the mask fits in 16 bits, MWCC emits one **`ori`** instruction; if the
bit is in the upper half of the word, it uses **`oris`** instead.

For example, setting bit 3 (mask `0x8`):

```c
u32 set_example(u32 x) {
    return x | 0x8;
}
```

```asm
set_example:
    ori     r3,r3,8
    blr
```

Look at the assembly for `setb` below and figure out which bit the mask
targets, then OR it in.

## Your task
Write `setb` on a `u32`, returning `x` with bit 1 set.

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
    return x | 0x2;
}
```
