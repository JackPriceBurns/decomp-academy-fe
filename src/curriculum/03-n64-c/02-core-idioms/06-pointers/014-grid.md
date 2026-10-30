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
  - "The row shift comes first, and the column shift second. Subtract the column shift (2, for words) from the row shift to get the row width in elements."
  - "The final instruction is a store of the fourth argument. It is a plain assignment into `g[r][c]`, using the row width that your shift arithmetic gave you."
---

# g[r][c] is two stacked trios

A two-dimensional array is a set of rows stored one after another. So
`g[r][c]` means "skip `r` whole rows, then go `c` elements into that row".
Each skip is an index scaling, and when the row width is a power of two, both
scalings are shifts. Here is a grid of words that is 4 wide:

```c
s32 cell4(s32 g[][4], s32 r, s32 c) {
    return g[r][c];
}
```

```asm
sll   t6, a1, 4     # r * 16: one row is 4 words = 16 bytes
addu  t7, a0, t6    # start of row r
sll   t8, a2, 2     # c * 4: the usual word stride
addu  t9, t7, t8    # &g[r][c]
lw    v0, 0(t9)     # the element
jr    ra
nop
```

There are two shift and add pairs, one after the other. You already know the
second one: `sll … 2` is word indexing. The *first* one is new. Its amount
gives the **row size in bytes**, here 16, so the row is 16 ÷ 4 = 4 elements
wide. That division is how you get the declared width of the array back from
the listing:

> row shift − element shift = log2(row width in elements)

`4 − 2 = 2`, so there are 4 words per row. The row width appears nowhere
else, because the assembly holds no array bounds. So this small subtraction
is the only way to rebuild the `[4]` in the declaration. If you get it wrong,
every row ends up at the wrong address.

The target writes instead of reading. The same stacked trios compute the
address of the slot, and they end in a store of the value argument. Its row
shift is different from the example's, so do the arithmetic before you
declare anything.

## Your task

Write `func_8034b028` to reproduce the target assembly.

<!-- solution -->
```c
void func_8034b028(s32 g[][8], s32 r, s32 c, s32 v) {
    g[r][c] = v;
}
```
