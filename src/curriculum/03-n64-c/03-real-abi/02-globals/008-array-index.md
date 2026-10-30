---
id: f28aa1ed-9ab8-4833-9cb3-c3fd6967047e
slug: globals-array-index
title: Indexing a Global Array
difficulty: 3
concepts:
  - globals
  - arrays
  - hi-lo
  - indexing
symbol: func_800a2a84
hints:
  - "This has the same structure as the worked example, but the final memory operation is a store. The value it stores is the second argument."
  - "`sll` by 2 multiplies the first argument by 4, which makes it an index into an array of words."
---

# Where the index joins the address

Indexing a global array combines two things you already know. One is the
`%hi`/`%lo` pair for the array's base. The other is index scaling: multiply by
the element size, which for words costs only an `sll` by 2. The new part is
*where* the index is added. Here is `getSlot(i)`, which returns element `i` of
the global word array `gTable`:

```asm
sll   t6, a0, 2             # i * 4: byte offset into an array of words
lui   v0, %hi(gTable)       # upper half of the base…
addu  v0, v0, t6            # …plus the scaled index, before %lo!
lw    v0, %lo(gTable)(v0)   # and the low half goes in the load, as usual
jr    ra
nop
```

The scaled index is added to the **`%hi` half alone**, and the `%lo` still
comes in through the load's offset field. Addition is associative, so
`(hi + index) + lo` reaches the same byte as `(hi + lo) + index`. IDO picks the
order that saves an instruction. Don't let this confuse you: the register being
indexed *never holds the finished base address*. Read the whole four-line
pattern as one unit (scale, upper half, add index, access with `%lo`) and
translate it to `array[index]`.

The target has the same structure, but in the other direction: something goes
*into* a slot of a global array. Check which register is the index and which is
the value. Then the direction of the memory operation tells you how to write
the C.

## Your task

`extern s32 gRows[16];` is declared for you. Write `func_800a2a84` to reproduce
the target assembly.

<!-- solution -->
```c
void func_800a2a84(s32 i, s32 v) {
    gRows[i] = v;
}
```

<!-- context -->
```c
extern s32 gRows[16];
```
