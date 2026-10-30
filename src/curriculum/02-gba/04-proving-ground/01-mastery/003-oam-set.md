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
  - "Every `and` here is a *keep* mask. It preserves the bits that the
    coordinate does not use. Take the complement of the mask to find the field,
    and read the second `and` on each path to get the field's width."
  - "OAM attribute 0 holds the Y coordinate in its low eight bits, and attribute
    1 holds X in its low nine bits. Shape, size and flip flags are in the bits
    above them, and the write must keep them unchanged."
  - "An `OamEntry *` and two `s32` coordinates go in, and nothing is returned.
    The two coordinates are not stored in the order they are declared, so
    follow the registers."
symbol: func_08403de4
---

# Packing a sprite into OAM

The GBA describes every sprite with four halfwords of object attribute memory.
Attribute 0 holds the Y coordinate in its low eight bits, with the shape, the
blend mode and the double-size flag packed above it. Attribute 1 holds X in its
low nine bits, with the flip flags and the size in the other bits. No value has
a word to itself. To move a sprite, the game rewrites part of a halfword and
leaves the rest exactly as it was.

The code for this has four steps: load, mask off the field, OR the new value in,
and store. It is the most common pattern in a GBA game's code, and people often
read it backwards. The mask in the `and` is the part being **kept**, so its
complement is the field. The second `and`, the one applied to the incoming
value, tells you how wide the field is.

Here it is on a tilemap entry, where the palette number is in the top four bits:

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

4095 is 0x0FFF, so the low twelve bits are kept and bits 12-15 are the field.
The `lsl #12` confirms this, because it shifts the new value into exactly that
position. The `lsl r1, #1` / `add r1, r0` at the top scales a halfword array
index and adds it to the base.

When the keep mask is a byte shifted left, agbcc builds it with two
instructions and does not use a pool word:

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

`mov r2, #192` / `lsl r2, #8` is 0xC000, so only the top two bits are kept. The
1023 from the pool confirms that a ten-bit field goes in. Notice that this
function calls nothing, yet it still starts with `push {r4, lr}`. Once gcc 2.9
decides to use `r4`, it pushes `lr` along with it, and the return becomes the
three-step `pop {r4}` / `pop {r0}` / `bx r0`. This pattern comes from register
pressure. It does not mean the function makes a call.

Your target rewrites both attribute halfwords, and it builds its masks in both
ways: two from a `mov` and a shift, and one from the pool. Work out each field
from its keep mask before you write any C.

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
