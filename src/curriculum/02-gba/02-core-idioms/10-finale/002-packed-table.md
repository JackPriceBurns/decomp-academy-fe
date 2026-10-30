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
    feeds an `and` is a mask, so do not read it as an address.
  - Count the set bits in each mask to get the field's width. Then read the
    `lsl` after it to get the field's position. A masked value with no shift
    after it stays where it is.
  - "The function takes a `u16 *` table, an `s32` index and an `s32` palette number, and returns an `s32`. It builds a background map entry: ten bits of tile number from the table, and four bits of palette starting at bit 12."
symbol: func_082cb92c
---

# Reading a packed word back into fields

Almost every value that the GBA hardware reads is packed. Examples are a
tile-map entry, an OAM attribute and a display control word. Each one holds
several independent fields in sixteen or thirty-two bits. To build one in C,
you use a mask, a shift and an `orr` for each field. If you read those three
instructions in the right order, the listing gives you the whole layout.

Here is a function that builds a sprite's second OAM attribute. It combines a
nine-bit X coordinate from one argument with a two-bit size code read from a
table:

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

The first two instructions read the table. `add r0, r1` adds the index to the
base with no scaling. That is only correct when each element is one byte wide.
A halfword table would have an `lsl #1` before that add, and a word table would
have an `lsl #2`. The `ldrb` then reads the entry.

Address 4 loads a word from the literal pool. Convert it: 511 is 0x1FF, which
is nine set bits, and it is `and`ed with `r2`. A `.word` that feeds an `and` is
a mask. You have already seen the literal pool hold constants and addresses. It
also holds masks that are too wide for `mov`. Nothing in the listing labels
which is which. Only the way the value is used tells you.

The other field is the pair at 8 and 10. The mask is 3, so the field is two
bits wide. It is followed by `lsl r0, #14`, so those two bits belong at bit 14.
`orr` then combines the two fields, and the function returns. Notice that the
nine-bit field is never shifted, because it is already at the bottom of the
word.

This gives you a rule for reading packed values. The `and` tells you a field's
**width**: count the set bits in the mask. The `lsl` after it tells you the
field's **position**. A masked value with no shift after it stays where it is.
Finally, the `.hword 0` at 18 is alignment padding, so that the pool word
starts on a four-byte boundary. It is data, and no C that you write produces it
directly.

Your target packs two fields into one word in the same way. First, convert
both masks to hex. Then note which of the two values gets shifted. The address
arithmetic at the top tells you how wide the table's elements are.

## Your task

Write `func_082cb92c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082cb92c(u16 *tbl, s32 i, s32 pal) {
    u32 v = tbl[i];
    return (v & 0x3FF) | ((pal & 0xF) << 12);
}
```
