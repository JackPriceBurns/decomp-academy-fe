---
id: gauntlet-setbit-2
title: Set bit 2
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 2 is mask 0x4.
  - "OR it in: `x | 0x4`."
---

# Set bit 2

Setting a single bit requires ORing in a mask that has only the target bit
set. For masks that fit in 16 bits, MWCC emits a single **`ori`**; masks in
the upper 16 bits produce **`oris`** instead.

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

Inspect the assembly for `setb` below. Determine which bit position the
immediate in `ori` corresponds to, then write the C that produces it.

## Your task
Write `setb` on a `u32`, returning `x` with bit 2 set.

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
    return x | 0x4;
}
```
