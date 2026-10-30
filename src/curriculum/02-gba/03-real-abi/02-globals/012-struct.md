---
id: a9ef3b0a-8e12-46e9-a34b-1428fd3b49e9
slug: gba-globals-struct
title: A Global Struct
difficulty: 4
concepts:
  - globals
  - structs
  - addressing
symbol: func_0834d150
hints:
  - One pool word covers the whole struct. Each field is that base plus its own
    offset, and the field at offset 0 needs no offset at all.
  - "It takes an `s32` and returns an `s32`. The load at `[r2, #8]` is the third word of the struct, and it happens after the write-back."
---

# One pool word for the whole struct

A struct at file scope is a single object, so it needs a single pool word: the
address of its first byte. Every field is that base plus a constant. The
constant goes into the load or store offset at no extra cost. The limit is the
same five-bit scaled offset as for an array. A word field has to be in the
first 124 bytes of the struct, a halfword field in the first 62, and a byte
field in the first 31.

`slotSpan` reads two fields of one global struct and subtracts them:

```asm
0        ldr       r0, [pc, #8] (->12)
2        ldrh      r1, [r0, #0]
4        ldr       r0, [r0, #4]
6        sub       r0, r1
8        bx        lr
10       .hword    0
12       .word     gSlot
```

The struct is `{ u16 id; u16 flags; s32 timer; }`. So `id` is at offset 0 and
`flags` is at 2. The two halfwords fill four bytes with no padding, so `timer`
is at 4. `ldrh r1, [r0, #0]` is `id`, and `ldr r0, [r0, #4]` is `timer`. The
instruction width tells you the field width, and the offset tells you which
field it is.

Writing works the same way, and here the offsets identify the fields even more
clearly:

```asm
0        ldr       r1, [pc, #8] (->12)
2        strh      r0, [r1, #2]
4        lsl       r0, #1
6        str       r0, [r1, #4]
8        bx        lr
10       .hword    0
12       .word     gSlot
```

`strh` at offset 2 is `flags`, and `str` at offset 4 is `timer`. The function
uses one pool word for two fields, with no address arithmetic anywhere.

That is the whole method for a global struct: read the offset, read the width,
and look up which field is there. An offset of zero means the first field. It
is also what a plain scalar global looks like, so the other field accesses are
what tell the two apart.

Your target accesses two fields of one struct and writes to one of them.

## Your task

Write `func_0834d150` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    s32 x;
    s32 y;
    s32 hp;
} Actor;

extern Actor gPlayer;
```

<!-- solution -->
```c
s32 func_0834d150(s32 dx) {
    gPlayer.x = gPlayer.x + dx;
    return gPlayer.hp;
}
```
