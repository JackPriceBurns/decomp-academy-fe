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
    The right shift gives you the width; the left shift plus that width tells
    you where the field starts.
  - A `struct Obj *` in, a `u32` out. Two fields are read and added, and one of
    them starts at bit zero.
symbol: func_08269534
---

# Two shifts describe a field exactly

A bitfield read is a shift pair. The compiler loads the word the field lives in,
shifts left to throw away every bit above the field, then shifts right to bring
the field down to bit 0 and clear everything above it. For an unsigned field the
right shift is `lsr`.

The two counts encode the field's position and size:

* the right shift is `32 - width`,
* the left shift is `32 - lsb - width`.

So `lsl #16` / `lsr #26` is a 6-bit field starting at bit 10. Work it in that
order — width from the right shift first, then the start — and you can name any
field from its shift pair without counting anything in the struct. Here is that
one as a whole function:

```asm
0        ldr       r0, [r0, #0]
2        lsl       r0, #16
4        lsr       r0, #26
6        bx        lr
```

Two cases fall out of the formula and look like something else entirely. A field
that reaches bit 31 needs no left shift, because there is nothing above it to
discard:

```asm
0        ldr       r0, [r0, #0]
2        lsr       r0, #20
4        bx        lr
```

That is a 12-bit field at bit 20 — `lsr #20` alone, and the width comes from the
struct rather than from a second shift. And a field that exactly fills the
bottom byte does not shift at all:

```asm
0        ldrb      r0, [r0, #0]
2        bx        lr
```

All three come from the same struct — `y : 8`, `mode : 2`, `gfx : 6`,
`size : 4`, `x : 12`, in that order — and the three functions read `gfx`, then
`x`, then `y`. A bitfield read that happens to be byte-aligned and byte-sized is
compiled as an ordinary narrow load, which is why an unremarkable `ldrb` is no
proof that the field was declared `u8`.

Your target reads two bitfields and combines them. Decode both shift pairs
before you go looking at the struct.

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
