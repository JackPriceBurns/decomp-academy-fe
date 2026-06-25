---
id: globals-array-index-narrow
title: "Index an Array, Narrow the Result"
difficulty: 4
concepts:
  - globals
  - array
  - addr16
  - lwzx
  - clrlwi
  - chaining
symbol: lookupByte
hints:
  - The array read is the familiar @ha/@l base, scaled index, and lwzx; the
    narrowing happens *after* the load.
  - "A `(u8)` cast of a value already in a register is a `clrlwi rD, rA, 24` -
    clear the top 24 bits, keep the low byte."
---

# Casting after an indexed load

When you read `(u8)tbl[i]` from an `int` array, the load itself is unchanged — a
word is still fetched with `lwzx` because the array's element type is `int`. The
cast happens *afterward*, on the value already sitting in a register. Narrowing a
register to a byte isn't a different load; it's a **mask**: `clrlwi rD, rA, 24`
clears the top 24 bits and keeps the low 8 — that is the `(u8)`.

This is different from a *byte global*, which loads with `lbz` directly. Here the
storage is a word, so you load a word and then throw away the high bits. Seeing
`lwzx` followed by `clrlwi ..., 24` is "read an int element, then cast it to a
byte." (A `(u16)` would be `clrlwi ..., 16`; a signed narrow would use
`extsb`/`extsh` instead.)

Consider `channel(k)`, which reads element `k` of the int array `gPixels` and
returns it as a `u8`:

```asm
lis   r4, gPixels@ha    # high half of &gPixels
slwi  r0, r3, 2         # k * 4
addi  r3, r4, gPixels@l # r3 = &gPixels
lwzx  r0, r3, r0        # r0 = gPixels[k]   (a full int)
clrlwi r3, r0, 24       # r3 = r0 & 0xFF    (the (u8) cast)
blr
```

The first four instructions are the plain indexed read; the `clrlwi ..., 24` is
the narrowing tacked on. The target assembly indexes a different array and
narrows to the same width — confirm the cast from the `clrlwi` count.

## Your task

`extern int gTable[];` is provided. Write `lookupByte`, taking an `int i` and
returning a `u8`, to reproduce the assembly above.

<!-- starter -->
```c
u8 lookupByte(int i) {
    return 0;
}
```

<!-- solution -->
```c
u8 lookupByte(int i) {
    return (u8)gTable[i];
}
```

<!-- context -->
```c
extern int gTable[];
```
