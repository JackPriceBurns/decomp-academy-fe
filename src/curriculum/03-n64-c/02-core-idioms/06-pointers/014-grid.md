---
id: 7d2c0a4f-3021-40dc-8e78-5de22aa85f63
slug: pointers-grid
title: "Two Dimensions, Two Shifts"
difficulty: 3
concepts:
  - pointers
  - arrays
  - indexing
  - shifts
symbol: func_8034b028
hints:
  - "Row shift first, column shift second. Subtract the column shift (2, for words) from the row shift to get the row width in elements."
  - "The final instruction is a store of the fourth argument — a plain assignment into `g[r][c]` with the row width your shift math produced."
---

# g[r][c] is two trios stacked

A two-dimensional array is rows laid end to end, so `g[r][c]` means
"skip `r` whole rows, then `c` elements into that row". Each skip is an
index scaling — and when the row width is a power of two, both are
shifts. Here's a 4-wide grid of words:

```c
s32 cell4(s32 g[][4], s32 r, s32 c) {
    return g[r][c];
}
```

```asm
sll   t6, a1, 4     # r * 16 — one row is 4 words = 16 bytes
addu  t7, a0, t6    # start of row r
sll   t8, a2, 2     # c * 4  — the familiar word stride
addu  t9, t7, t8    # &g[r][c]
lw    v0, 0(t9)     # the element
jr    ra
nop
```

Two shift-add pairs, chained. The second one you know by heart —
`sll … 2` is word indexing. The *first* is the new information: its
amount encodes the **row size in bytes**, here 16, so the row is
16 ÷ 4 = 4 elements wide. That division is how you recover the array's
declared width from the listing:

> row shift − element shift = log2(row width in elements)

`4 − 2 = 2`, so 4 words per row. The row width isn't stated anywhere
else — no bounds live in the assembly — so this little subtraction is
the only way to reconstruct the `[4]` in the declaration, and getting
it wrong shifts every row.

The target writes instead of reads: same stacked trios computing the
slot's address, ending in a store of the value argument. Its row shift
is different from the example's — do the arithmetic before declaring
anything.

## Your task

Write `func_8034b028` to reproduce the target assembly.

<!-- solution -->
```c
void func_8034b028(s32 g[][8], s32 r, s32 c, s32 v) {
    g[r][c] = v;
}
```
