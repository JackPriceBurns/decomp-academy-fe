---
id: 91429953-b03c-554b-8972-e2ccd6d8f886
slug: globals-array-index-narrow
title: "Index an Array, Narrow the Result"
difficulty: 4
concepts:
  - globals
  - array
  - addr16
  - lwzx
  - clrlwi
  - chaining
symbol: func_80050a64
hints:
  - The array read is the familiar @ha/@l base, scaled index, and lwzx; the
    narrowing happens *after* the load.
  - "A `(u8)` cast of a value already in a register is a `clrlwi rD, rA, 24` -
    clear the top 24 bits, keep the low byte."
---

# Casting after an indexed load

A cast like `(u8)tbl[i]` doesn't touch the load at all. You still pull a full
word with `lwzx`, because the array elements are `int`. The cast happens later,
once the word is sitting in `r0`, with no second trip to memory. The narrowing is
one instruction: `clrlwi rD, rA, 24`, which clears the top 24 bits and keeps the
low 8. That's your `(u8)`.

Compare that to a *byte global*, where `lbz` would just fetch the byte. With word
storage you read all 32 bits and then mask the top ones. So `lwzx` followed by
`clrlwi ..., 24` is exactly an int element trimmed down to a byte. Same idea for
`(u16)`, only the count becomes `16`. For a signed narrow you'd use `extsb` or
`extsh`.

Here's `channel(k)`. It pulls element `k` out of the int array `gPixels` and
returns it as a `u8`:

```asm
lis   r4, gPixels@ha    # high half of &gPixels
slwi  r0, r3, 2         # k * 4
addi  r3, r4, gPixels@l # r3 = &gPixels
lwzx  r0, r3, r0        # r0 = gPixels[k]   (a full int)
clrlwi r3, r0, 24       # r3 = r0 & 0xFF    (the (u8) cast)
blr
```

The first four lines are the plain indexed read. Only the trailing `clrlwi ...,
24` narrows anything. Your target hits a different array but narrows to the same
width, so count the bits in its `clrlwi` to confirm the cast.

## Your task

`extern int gTable[];` is provided. Write `func_80050a64` to reproduce the
assembly above.

<!-- solution -->
```c
u8 func_80050a64(int i) {
    return (u8)gTable[i];
}
```

<!-- context -->
```c
extern int gTable[];
```
