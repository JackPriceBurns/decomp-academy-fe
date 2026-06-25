---
id: bitwise-pack-three
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

# Many shifts, many ORs — packing a full word

This capstone brings together everything from the chapter. Three independent
shifts position three values at distinct byte lanes, and two chained ORs merge
them into a single 32-bit word.

Consider `pack_word(hi, mid, lo)`, which packs three bytes at positions 24, 16,
and 0 of a 32-bit result:

```asm
slwi    r3,r3,24
slwi    r0,r4,16
or      r0,r3,r0
or      r3,r5,r0
blr
```

- `slwi r3, r3, 24` shifts `hi` up to bits 31–24 (the top byte).
- `slwi r0, r4, 16` shifts `mid` up to bits 23–16 (the second byte).
- `or   r0, r3, r0` merges the two shifted values: `r0` now holds `hi` and
  `mid` in their correct positions, with the rest zero.
- `or   r3, r5, r0` inserts `lo` (unshifted, occupying bits 7–0) into the word.

The chain reads left to right: two shifts, a first OR that combines the high
pair, then a second OR that slots in the final unshifted byte.

The target assembly uses the same four-instruction shape but with different shift
amounts. Read the two `slwi` amounts to find where each value lands, then trace
the ORs to reconstruct the full expression.

## Your task

Write `pack_three`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int pack_three(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int pack_three(int a, int b, int c) {
    return (a << 16) | (b << 8) | c;
}
```
