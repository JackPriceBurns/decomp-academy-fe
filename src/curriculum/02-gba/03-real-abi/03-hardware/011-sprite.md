---
id: 67daac3d-c003-49ec-b531-dcd84cbe2b1f
slug: gba-hardware-sprite
title: Updating a Sprite
difficulty: 5
concepts:
  - hardware
  - structs
  - volatile
symbol: func_083828c0
hints:
  - A `vu16 *` never produces a load whose result is unused right before a
    store to the same address. The qualifier has to be on the aggregate (the
    struct).
  - "A slot index and two coordinates go in, and nothing comes out. The index is
    a `u32` and the coordinates are `u16`. OAM starts at 0x07000000, an entry is
    eight bytes, attr0 holds Y in its low byte, and attr1 holds X in its low
    nine bits."
---

# The load that is never used

Object attribute memory holds 128 sprites of eight bytes each, at
`0x07000000`. Three of the four halfwords in each entry are attributes.
`attr0` holds the Y coordinate in its low byte, plus the shape and mode flags.
`attr1` holds a nine-bit X, plus the size. `attr2` holds the tile number and
palette bank. The fourth halfword belongs to the rotation and scaling tables,
which are spread through OAM between the entries. GBA code almost always models
an entry as a struct with four fields and indexes an array of them. So a slot
number is multiplied by eight instead of by two.

Here is a sprite being switched off by writing the disable bit into `attr0`:

```asm
0        lsl       r0, #3
2        mov       r1, #224
4        lsl       r1, #19
6        add       r0, r1
8        ldrh      r1, [r0, #0]
10       mov       r1, #128
12       lsl       r1, #2
14       strh      r1, [r0, #0]
16       bx        lr
```

Look at offsets 8 and 10. The `ldrh` loads the current attribute into `r1`, and
the very next instruction overwrites `r1` with the constant being stored. The
load is dead. Nothing reads it, and removing it would not change what the
program does. gcc emitted it anyway.

This dead load is the sign of an assignment to a member of a **volatile
struct**. agbcc reads the destination halfword before it writes it, once for
each member assignment. It does this only for struct members. A plain `vu16 *`
store produces the `strh` alone. If a listing shows a load right before a store
to the same address, and the loaded register is never used, the original code
had a `volatile` aggregate. No rewrite that uses scalar pointers will match it.

A constant slot skips the index arithmetic completely. The offset goes straight
into the addressing mode:

```asm
0        lsl       r0, #16
2        lsr       r0, #16
4        lsl       r1, #16
6        mov       r2, #224
8        lsl       r2, #19
10       lsr       r1, #4
12       orr       r0, r1
14       ldrh      r1, [r2, #28]
16       strh      r0, [r2, #28]
18       bx        lr
```

`[r2, #28]` is entry 3, member `attr2`: three entries of eight bytes, plus four.
The dead load appears again, at the same offset as the store.

Now combine that with a read-modify-write, which is what real sprite code does.
A coordinate has to be merged into an attribute without changing the flags
packed next to it. The merge needs a real load of the old value, and the dead
load happens as well. So **each attribute you update produces two `ldrh` from
the same address**: the one whose value you mask, and the unused one, placed
between the `orr` and the `strh`. The first time you see this pair, it looks
like a disassembler error. It is exactly what the compiler emits.

## Your task

Write `func_083828c0` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    u16 attr0;
    u16 attr1;
    u16 attr2;
    u16 fill;
} OamEntry;
```

<!-- solution -->
```c
void func_083828c0(u32 slot, u16 x, u16 y)
{
    volatile OamEntry *o = (volatile OamEntry *)0x07000000;
    o[slot].attr0 = (o[slot].attr0 & 0xFF00) | y;
    o[slot].attr1 = (o[slot].attr1 & 0xFE00) | x;
}
```
