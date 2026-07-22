---
id: d055ad48-6482-50da-b594-ef54b7cba144
slug: bitwise-pack-three
title: "Capstone: Pack Three Values into One Word"
difficulty: 3
concepts:
  - bitwise
  - shift
  - or
  - chaining
  - capstone
symbol: pack_three
hints:
  - Each `slwi` positions one value at a different byte boundary in the 32-bit result.
  - The two `or` instructions fold the three shifted values together, one pair at a time.
---

# Many shifts, many ORs, packing a full word

Here's the capstone, and it leans on every trick the chapter built up. Three
separate shifts park three values in their own byte lanes, then a pair of chained
ORs fuse the lot into one 32-bit word.

Take `pack_word(hi, mid, lo)`. It drops three bytes at positions 24, 16, and 0 of
the result.

```asm
slwi    r3,r3,24
slwi    r0,r4,16
or      r0,r3,r0
or      r3,r5,r0
blr
```

The first `slwi r3, r3, 24` lifts `hi` all the way up into bits 31–24, the top
byte. Right behind it, `slwi r0, r4, 16` puts `mid` into bits 23–16. Those two
get welded together by `or r0, r3, r0`, so `r0` is now carrying `hi` and `mid` in
place with zeros everywhere else. Last comes `or r3, r5, r0`, which folds in `lo`
untouched down at bits 7–0. Read top to bottom that's two shifts, an OR for the
high pair, then an OR to seat the final byte.

The target keeps that same four-instruction skeleton but moves the shift amounts.
Read the two `slwi` counts to learn where each value lands, then follow the ORs
back to the expression that produced them.

## Your task

Write `pack_three` to reproduce the assembly above.

<!-- solution -->
```c
int pack_three(int a, int b, int c) {
    return (a << 16) | (b << 8) | c;
}
```
