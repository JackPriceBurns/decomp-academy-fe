---
id: e7ea1b1f-dc79-4aa2-aee1-cf63fa0fd7ac
slug: gba-structs-bitfield-read
title: Reading a Bitfield
difficulty: 3
concepts:
  - structs
  - bitfields
  - shifts
hints:
  - Turn each shift pair into a bit range before you look at the context struct.
    The right shift gives you the width. The left shift plus that width tells
    you where the field starts.
  - The function takes a `struct Obj *` and returns a `u32`. Two fields are read
    and added, and one of them starts at bit zero.
symbol: func_08269534
---

# Two shifts describe a field exactly

A bitfield read is a pair of shifts. The compiler loads the word that contains
the field. It shifts left to remove every bit above the field, and then shifts
right to move the field down to bit 0 and clear everything above it. For an
unsigned field, the right shift is `lsr`.

The two shift counts give the field's position and size. Here `lsb` is the bit
where the field starts:

* the right shift is `32 - width`,
* the left shift is `32 - lsb - width`.

So `lsl #16` / `lsr #26` is a 6-bit field starting at bit 10. Work in that
order: first the width from the right shift, then the start. That way you can
name any field from its shift pair without counting anything in the struct.
Here is that field read as a whole function:

```asm
0        ldr       r0, [r0, #0]
2        lsl       r0, #16
4        lsr       r0, #26
6        bx        lr
```

Two cases follow from the formula but look quite different. A field that
reaches bit 31 needs no left shift, because there are no bits above it to
remove:

```asm
0        ldr       r0, [r0, #0]
2        lsr       r0, #20
4        bx        lr
```

That is a 12-bit field at bit 20. There is only `lsr #20`, and the width comes
from the struct instead of from a second shift. A field that exactly fills the
bottom byte is not shifted at all:

```asm
0        ldrb      r0, [r0, #0]
2        bx        lr
```

All three functions use the same struct, with the fields `y : 8`, `mode : 2`,
`gfx : 6`, `size : 4` and `x : 12` in that order. The three functions read
`gfx`, then `x`, then `y`. A bitfield read that is byte-aligned and byte-sized
compiles to an ordinary narrow load. So a plain `ldrb` does not prove that the
field was declared `u8`.

Your target reads two bitfields and combines them. Decode both shift pairs
before you look at the struct.

## Your task

Write `func_08269534` to reproduce the target assembly.

<!-- context -->
```c
struct Obj {
    u32 pal : 4;
    u32 shape : 2;
    u32 tile : 10;
    u32 prio : 2;
    u32 rest : 14;
};
```

<!-- solution -->
```c
u32 func_08269534(struct Obj *o) {
    return o->tile + o->pal;
}
```
