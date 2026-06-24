---
id: gauntlet-setbit-4
title: Set bit 4
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 4 is mask 0x10.
  - "OR it in: `x | 0x10`."
---

# Set bit 4

To force a specific bit to 1, OR the value with a mask that has only that bit set. The mask for bit N is `1 << N`. When that mask fits in the `ori` 16-bit immediate field, MWCC emits a single **`ori`**; masks that require the upper 16 bits use **`oris`** instead.

For example, forcing bit 6 of a `u32` — whose mask is `0x40` — compiles to:

```
ori  r3,r3,64
blr
```

Look at the assembly below: which bit position is the `ori` immediate encoding? That tells you the mask, and the mask tells you the C.

## Your task
Write `setb` on a `u32`, returning `x` with bit 4 set.

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
    return x | 0x10;
}
```
