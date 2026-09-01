---
id: da029424-ec98-49c9-a809-13d88bd3cc11
slug: gba-finale-packed-table
title: Packing From a Table
difficulty: 4
concepts:
  - bitwise
  - memory
  - constants
hints:
  - Convert the pool word to hex before you do anything else. A `.word` that
    feeds an `and` is a mask, not an address.
  - Count the set bits in each mask to get a field's width, then read the `lsl`
    after it to get the field's position. A masked value with no shift after it
    stays where it already is.
  - "A `u16 *` table, an `s32` index and an `s32` palette number in, an `s32` out. It builds a background map entry: ten bits of tile number from the table, four bits of palette starting at bit 12."
symbol: func_082cb92c
---

# Reading a packed word back into fields

Almost every number the GBA hardware consumes is packed: a tile-map entry, an
OAM attribute, a display control word. Each one is a handful of independent
fields sharing sixteen or thirty-two bits, and building one in C is a mask, a
shift and an `orr` per field. The listing gives you the whole layout if you read
those three in the right order.

Here is a function that builds a sprite's second OAM attribute — a nine-bit X
coordinate from one argument, and a two-bit size code fetched from a table:

```asm
0        add       r0, r1
2        ldrb      r0, [r0, #0]
4        ldr       r3, [pc, #12] (->20)
6        and       r3, r2
8        mov       r1, #3
10       and       r0, r1
12       lsl       r0, #14
14       orr       r0, r3
16       bx        lr
18       .hword    0
20       .word     511
```

The table read is the first two instructions. `add r0, r1` is base plus index
with no scaling at all, which is only correct when each element is one byte
wide; a halfword table puts an `lsl #1` in front of that add and a word table an
`lsl #2`. The `ldrb` then reads the entry.

Address 4 fetches a pool word. Decode it: 511 is 0x1FF, nine bits, and it is
being `and`ed with `r2`. A `.word` that feeds an `and` is a mask — the same
literal pool you have been reading as constants and addresses also holds masks
too wide for `mov`, and nothing in the listing labels which is which except what
the value gets used for.

The other field is the pair at 8 and 10: mask 3, so two bits wide, followed by
`lsl r0, #14`, so those two bits belong at bit 14. `orr` merges the two halves
and the function is done. Notice that the nine-bit field never gets a shift,
because it was already at the bottom of the word.

That gives you the reading rule. The `and` tells you a field's **width** — count
the set bits in the mask. The `lsl` after it tells you the field's **position**.
A masked value with no shift following it stays where it is. And the `.hword 0`
at 18 is alignment padding so the pool word lands on a four-byte boundary; it is
data, and no C you write produces it directly.

Your target packs two fields into one word the same way. Work out both masks in
hex first, note which of the two values gets shifted, and let the address
arithmetic at the top tell you how wide the table's elements are.

## Your task

Write `func_082cb92c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082cb92c(u16 *tbl, s32 i, s32 pal) {
    u32 v = tbl[i];
    return (v & 0x3FF) | ((pal & 0xF) << 12);
}
```
