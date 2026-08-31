---
id: 76597d9e-65df-4959-bd06-958e07972aa0
slug: globals-array-const-index
title: A Constant Index Melts Into the Name
difficulty: 2
concepts:
  - globals
  - arrays
  - hi-lo
  - relocations
symbol: func_801965f4
hints:
  - "The number glued to the symbol name is a byte offset. Divide by the element size to recover the index."
  - "`gGrid` holds words: four bytes each."
---

# gTable12 is not a typo

Index a global array with a *constant*, and the scaling, the add — all of it —
happens at compile time. The element's address is just `base + constant`, and
that constant folds directly into the relocation. Here's `thirdSlot`, which
returns element 3 of the global word array `gTable`:

```asm
lui   v0, %hi(gTable12)
lw    v0, %lo(gTable12)(v0)
jr    ra
nop
```

Two instructions — identical to reading a plain global. The only trace of the
array is in how the diff prints the relocation: the byte offset is glued onto
the symbol name, so `gTable12` means "`gTable`, plus 12 bytes". Twelve bytes
into an array of 4-byte words is element **3**: `gTable[3]`.

That glued number is always in **bytes**, so recovering the C index means
dividing by the element size — the size given by the array's declaration.
Misread `gTable12` as "element 12" and your compile will reach for a slot far
away; the diff will show mismatched addends immediately, which is your cue to
recheck the arithmetic.

The target reads one constant slot of a global word array. Read the addend,
do the division, write the index.

## Your task

`extern s32 gGrid[40];` is declared for you. Write `func_801965f4` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_801965f4(void) {
    return gGrid[5];
}
```

<!-- context -->
```c
extern s32 gGrid[40];
```
