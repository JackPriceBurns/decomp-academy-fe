---
id: 12a17d02-838f-5d18-b7f3-9b737f046647
slug: pointers-two-arrays
title: Combining Two Arrays at the Same Index
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - arrays
  - chaining
symbol: func_800a85f4
hints:
  - The same variable index scales once, then drives an indexed load from each of
    the two base pointers.
  - One `slwi`, then two `lwzx` sharing the scaled offset register, then a combine.
---

# One offset, two bases

Index two arrays by the same variable and the compiler computes the scaled byte
offset once, then reuses it. `i*size` ends up in one register. Each `lwzx` pairs
that offset with its own base pointer, so the two array bases appear in `r3` and
`r4`. This is the clearest demonstration that an indexed load wants two register
operands. Freeze the offset, swap the base, and you're walking a second array.

`add_arrays(x, y, j)` reads `x[j]` and `y[j]`, then adds them:

```asm
slwi r0, r5, 2    # j * 4   (j is the third arg, in r5)
lwzx r3, r3, r0   # x[j]    (base x in r3 + offset)
lwzx r0, r4, r0   # y[j]    (base y in r4 + same offset)
add  r3, r3, r0   # x[j] + y[j]
blr
```

One `slwi` scales `j`. The offset sits in `r0` and drives both `lwzx` instructions;
only the base register differs. Your target also combines two arrays at the same
index, but with a different operation. Check the instruction after the two `lwzx`
to find out which.

## Your task

Write `func_800a85f4` to reproduce the assembly above.

<!-- solution -->
```c
int func_800a85f4(int* a, int* b, int i) {
    return a[i] * b[i];
}
```
