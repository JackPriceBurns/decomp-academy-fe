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
  - A load whose result is never read, sitting immediately before a store to the
    same address, is not something a `vu16 *` can produce. The qualifier has to
    be on the aggregate.
  - "A slot index and two coordinates go in - the index a `u32`, the coordinates
    `u16` - and nothing comes out. OAM starts at 0x07000000, an entry is eight
    bytes, attr0 holds Y in its low byte and attr1 holds X in its low nine
    bits."
---

# The load that goes nowhere

Object attribute memory is 128 sprites of eight bytes each at `0x07000000`.
Three of those four halfwords are attributes — `attr0` carries the Y
coordinate in its low byte plus the shape and mode flags, `attr1` carries a
nine-bit X plus the size, `attr2` carries the tile number and palette bank —
and the fourth belongs to the rotation and scaling tables interleaved through
OAM. GBA code almost always models that as a four-field struct and indexes it,
so a slot number is scaled by eight rather than by two.

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
load is dead. Nothing reads it, removing it would change nothing about the
program's meaning, and gcc emitted it anyway.

That dead load is the fingerprint of assigning to a member of a **volatile
struct**. agbcc reads the destination halfword before writing it, once per
member assignment, and it does this only for struct members — a plain
`vu16 *` store produces the `strh` alone. If a listing shows a load immediately
before a store to the same address with the loaded register unused, the original
code had a `volatile` aggregate, and no amount of rewriting with scalar pointers
will match it.

A constant slot skips the index arithmetic entirely and folds into the
addressing mode:

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

`[r2, #28]` is entry 3, member `attr2`: three entries of eight bytes plus four.
The dead load is right there again, at the same offset as the store.

Now put that together with a read-modify-write, which is what real sprite code
does — a coordinate has to be merged into an attribute without disturbing the
flags packed alongside it. The merge needs a genuine load of the old value, and
the dead load happens as well, so **each attribute you update produces two
`ldrh` from the same address**: the one whose value you mask, and the one that
goes nowhere, wedged between the `orr` and the `strh`. That pairing looks like a
disassembler error the first time you meet it. It is exactly what the compiler
emits.

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
