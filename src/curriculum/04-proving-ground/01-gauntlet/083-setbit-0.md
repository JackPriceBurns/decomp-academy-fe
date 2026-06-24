---
id: gauntlet-setbit-0
title: Set bit 0
difficulty: 2
concepts:
  - bitwise
  - masks
symbol: setb
hints:
  - Bit 0 is mask 0x1.
  - "OR it in: `x | 0x1`."
---

# Set bit 0

To force a specific bit high without disturbing the others, use bitwise OR with
a mask. The compiler emits **`ori`** when the mask fits in the 16-bit immediate
field; masks in the upper 16 bits would use `oris` instead.

For example, setting bit 2 of a `u32`:

```
ori     r3,r3,4
blr
```

The mask value in the `ori` immediate tells you which bit (or bits) are being
set. Work out what mask corresponds to the target bit number, then write the OR
expression.

## Your task
Write `setb` on a `u32`, returning `x` with bit 0 set.

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
    return x | 0x1;
}
```
