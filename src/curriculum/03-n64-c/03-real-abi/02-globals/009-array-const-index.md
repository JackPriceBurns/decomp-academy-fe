---
id: 76597d9e-65df-4959-bd06-958e07972aa0
slug: globals-array-const-index
title: A Constant Index Becomes Part of the Name
difficulty: 2
concepts:
  - globals
  - arrays
  - hi-lo
  - relocations
symbol: func_801965f4
hints:
  - "The number attached to the symbol name is a byte offset. Divide it by the element size to get the index."
  - "`gGrid` holds words, which are four bytes each."
---

# gTable12 is not a typo

When you index a global array with a *constant*, the scaling and the add both
happen at compile time. The element's address is `base + constant`, and the
compiler puts that constant directly into the relocation. Here is `thirdSlot`,
which returns element 3 of the global word array `gTable`:

```asm
lui   v0, %hi(gTable12)
lw    v0, %lo(gTable12)(v0)
jr    ra
nop
```

That is two instructions, the same as reading a plain global. The only sign of
the array is in how the diff prints the relocation. The byte offset is attached
to the end of the symbol name, so `gTable12` means "`gTable`, plus 12 bytes".
Twelve bytes into an array of 4-byte words is element **3**: `gTable[3]`.

The attached number is always in **bytes**. To recover the C index, divide it by
the element size, which comes from the array's declaration. If you misread
`gTable12` as "element 12", your compile will access a slot much further along.
The diff will show mismatched addends straight away, which tells you to recheck
the arithmetic.

The target reads one constant slot of a global word array. Read the addend,
divide it by the element size, and use the result as the index.

## Your task

`extern s32 gGrid[40];` is declared for you. Write `func_801965f4` to reproduce
the target assembly.

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
