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
  - "Same skeleton as the worked example, but the final memory op is a store — and what it stores is the second argument."
  - "`sll` by 2 scales the first argument by 4: an index into an array of
    words."
---

# The index joins the address mid-flight

Indexing a global array fuses two things you know: the `%hi`/`%lo` pair for
the array's base, and index scaling — multiply by the element size, which for
words is a free `sll` by 2. The interesting part is *where* the index joins.
Here's `getSlot(i)`, which returns element `i` of the global word array
`gTable`:

```asm
sll   t6, a0, 2             # i * 4: byte offset into an array of words
lui   v0, %hi(gTable)       # upper half of the base…
addu  v0, v0, t6            # …plus the scaled index — before %lo!
lw    v0, %lo(gTable)(v0)   # and the low half rides the load, as ever
jr    ra
nop
```

The scaled index is added to the **`%hi` half alone**, and the `%lo` still
arrives via the load's offset field. Addition is associative, so
`(hi + index) + lo` lands on the same byte as `(hi + lo) + index` — IDO picks
the order that saves an instruction. Don't let it rattle you: the register
being indexed *never holds the finished base address*. Read the whole
four-line shape as one unit — scale, upper half, add index, access with `%lo`
— and translate it to `array[index]`.

The target has the identical skeleton pointed the other way: something goes
*into* a slot of a global array. Check which register is the index, which is
the value, and let the memory op's direction write the C for you.

## Your task

`extern s32 gRows[16];` is declared for you. Write `func_800a2a84` to reproduce the
target assembly.

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
