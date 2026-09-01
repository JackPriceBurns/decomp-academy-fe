---
id: 3ca10245-b12d-4415-ad36-7e78e04406c5
slug: gba-mastery-oam-set
title: Positioning a Sprite
difficulty: 3
concepts:
  - hardware-registers
  - bitfields
  - structs
hints:
  - Every `and` here is a *keep* mask - it preserves the bits the coordinate
    does not live in. Complement the mask to find the field, and read the second
    `and` on each path for the field's width.
  - "OAM attribute 0 holds the Y coordinate in its low eight bits; attribute 1
    holds X in its low nine. Shape, size and flip flags live in the bits above
    them and have to survive the write."
  - "An `OamEntry *` and two `s32` coordinates, nothing returned. The two
    coordinates are not stored in the order they are declared - follow the
    registers."
symbol: func_08403de4
---

# Packing a sprite into OAM

The GBA describes every sprite in four halfwords of object attribute memory.
Attribute 0 carries the Y coordinate in its low eight bits, with the shape, the
blend mode and the double-size flag packed above it. Attribute 1 carries X in
its low nine bits, with the flip flags and the size in the rest. There is no
room for anything to have its own word, so moving a sprite means rewriting part
of a halfword and leaving the rest exactly as it was.

That shape - load, mask off the field, or the new value in, store - is the most
common thing in a GBA game's code, and it is easy to read backwards. The mask
in the `and` is the part being **kept**, so its complement is the field. The
second `and`, the one applied to the incoming value, tells you how wide the
field is.

Here it is on a tilemap entry, where the palette number sits in the top four
bits:

```asm
0        lsl       r1, #1
2        add       r1, r0
4        ldrh      r3, [r1, #0]
6        ldr       r0, [pc, #12] (->20)
8        and       r0, r3
10       lsl       r2, #12
12       orr       r0, r2
14       strh      r0, [r1, #0]
16       bx        lr
18       .hword    0
20       .word     4095
```

4095 is 0x0FFF, so the low twelve bits survive and bits 12-15 are the field -
confirmed by the `lsl #12` that shifts the new value into exactly that place.
The `lsl r1, #1` / `add r1, r0` at the top is a halfword array index being
scaled and folded into the base.

When the keep-mask happens to be a byte shifted left, agbcc builds it in two
instructions instead of spending a pool word:

```asm
0        push      {r4, lr}
2        ldrh      r3, [r0, #0]
4        mov       r2, #192
6        lsl       r2, #8
8        and       r2, r3
10       ldr       r4, [pc, #16] (->28)
12       mov       r3, r4
14       and       r1, r3
16       orr       r2, r1
18       strh      r2, [r0, #0]
20       pop       {r4}
22       pop       {r0}
24       bx        r0
26       .hword    0
28       .word     1023
```

`mov r2, #192` / `lsl r2, #8` is 0xC000: only the top two bits are kept, and the
pooled 1023 confirms a ten-bit field going in. Notice this function calls
nothing and still opens with `push {r4, lr}` - once gcc 2.9 decides it wants
`r4`, the push comes along with `lr` and the return turns into the three-step
`pop {r4}` / `pop {r0}` / `bx r0`. That is a register-pressure signature, not
evidence of a call.

Your target rewrites both attribute halfwords, and it builds its masks both
ways - two of them out of a `mov` and a shift, one out of the pool. Work out
each field from its keep-mask before you write a line of C.

## Your task

Write `func_08403de4` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    u16 attr0;
    u16 attr1;
    u16 attr2;
    u16 pad;
} OamEntry;
```

<!-- solution -->
```c
void func_08403de4(OamEntry *o, s32 x, s32 y)
{
    o->attr0 = (o->attr0 & 0xFF00) | (y & 0xFF);
    o->attr1 = (o->attr1 & 0xFE00) | (x & 0x1FF);
}
```
